from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import base64
import numpy as np
import cv2
import json
import traceback
import asyncio
import requests
from datetime import datetime, timezone
from service.vehicle_speed_stream_service import VehicleSpeedStreamService

router = APIRouter()

speed_service = VehicleSpeedStreamService()
frontend_clients: set[WebSocket] = set()

ORION_URL = "http://localhost:1026"
FIWARE_SERVICE = "openiot"
ORION_SENSOR_ID = "traffic001"


def publish_to_orion_ld(sensor_id: str, metrics: dict):
    """
    Publish metrics to Orion-LD in full-URI NGSI-LD format (Smart Data Models).
    Logic (PATCH -> create -> fallback POST attrs) kept unchanged.
    """
    try:
        def to_native(o):
            if isinstance(o, np.generic):
                return o.item()
            if isinstance(o, np.ndarray):
                return [to_native(x) for x in o.tolist()]
            if isinstance(o, (list, tuple, set)):
                return [to_native(x) for x in o]
            if isinstance(o, dict):
                return {str(k): to_native(v) for k, v in o.items()}
            if isinstance(o, datetime):
                return o.isoformat()
            if isinstance(o, (bytes, bytearray)):
                try:
                    return o.decode("utf-8")
                except:
                    return list(o)
            if isinstance(o, (int, float, str, bool, type(None))):
                return o
            return str(o)

        observed_at = datetime.now(timezone.utc).isoformat()
        entity_id = f"urn:ngsi-ld:TrafficFlowObserved:{sensor_id}"

        raw = {
            "https://smartdatamodels.org/intensity": metrics.get("current_count", 0),
            "https://smartdatamodels.org/averageVehicleSpeed": metrics.get("current_avg_speed", 0),
            "https://smartdatamodels.org/congested": bool(metrics.get("current_avg_speed", 0) < 30),
            "https://smartdatamodels.org/occupancy": min(metrics.get("current_count", 0) / 20.0, 1.0),
            "https://smartdatamodels.org/dateObserved": observed_at
        }

        sanitized = {k: to_native(v) for k, v in raw.items()}

        ngsi_ld_data = {
            k: {
                "type": "Property",
                "value": v,
                "observedAt": observed_at
            }
            for k, v in sanitized.items()
        }

        url = f"{ORION_URL}/ngsi-ld/v1/entities/{entity_id}/attrs"
        headers = {"Content-Type": "application/json", "NGSILD-Tenant": FIWARE_SERVICE}

        response = None
        try:
            response = requests.patch(url, json=ngsi_ld_data, headers=headers, timeout=5)
        except:
            pass

        if response is None or response.status_code == 404:
            create_url = f"{ORION_URL}/ngsi-ld/v1/entities"
            entity_body = {
                "id": entity_id,
                "type": "https://smartdatamodels.org/dataModel.Transportation/TrafficFlowObserved",
                "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld",
                **ngsi_ld_data
            }
            try:
                resp = requests.post(
                    create_url,
                    json=entity_body,
                    headers={"Content-Type": "application/ld+json", "NGSILD-Tenant": FIWARE_SERVICE},
                    timeout=5
                )
                return resp.status_code in (201, 204)
            except:
                return False

        if response.status_code in (200, 204):
            return True

        try:
            fallback = requests.post(url, json=ngsi_ld_data, headers=headers, timeout=5)
            return fallback.status_code in (200, 204)
        except:
            return False

    except:
        traceback.print_exc()
        return False


@router.websocket("/ws/frontend")
async def frontend_ws(ws: WebSocket):
    await ws.accept()
    frontend_clients.add(ws)
    print(f"[WS] frontend client connected (total={len(frontend_clients)})")

    try:
        while True:
            try:
                await ws.receive_text()
            except:
                try:
                    await ws.receive_bytes()
                except:
                    await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass
    finally:
        frontend_clients.discard(ws)
        print(f"[WS] frontend client disconnected (total={len(frontend_clients)})")


@router.websocket("/ws/process")
async def process_stream(ws: WebSocket):
    await ws.accept()
    print("[WS] Client connected to video processor")

    try:
        init_msg = await ws.receive_json()
    except WebSocketDisconnect:
        print("[WS] client disconnected before sending init config")
        return
    except Exception as e:
        print(f"[WS] failed to read init config: {e}")
        await ws.close()
        return

    try:
        speed_service.init_stream(
            image_pts=init_msg["image_pts"],
            world_pts=init_msg["world_pts"],
            classes=init_msg.get("classes"),
            conf=init_msg.get("conf"),
            tracker_cfg=init_msg.get("tracker_cfg"),
            yolo_weights=init_msg.get("yolo_weights"),
            fps=init_msg.get("fps", 30),
        )
    except Exception as e:
        print(f"[WS] init_stream error: {e}")
        await ws.close()
        return

    frame_count = 0
    publish_interval = 10

    print(f"[WS] Starting video processing (Orion publish every {publish_interval} frames)")

    while True:
        try:
            raw = await ws.receive_bytes()
            b64 = raw.decode("utf-8")
            jpg_bytes = base64.b64decode(b64)

            arr = np.frombuffer(jpg_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            processed, metrics = speed_service.process_frame(frame)
            frame_count += 1

            ok, encoded = cv2.imencode(".jpg", processed)
            if not ok:
                continue
            jpg_bytes_out = encoded.tobytes()
            out64 = base64.b64encode(jpg_bytes_out).decode("utf-8")

            try:
                await ws.send_text(out64)
            except:
                pass

            if frame_count % publish_interval == 0:
                publish_to_orion_ld(ORION_SENSOR_ID, metrics)

            if frontend_clients:
                dead = []

                for client in list(frontend_clients):
                    try:
                        await client.send_bytes(jpg_bytes_out)
                    except:
                        dead.append(client)

                if frame_count % 5 == 0:
                    msg = json.dumps({"type": "metrics", "data": metrics})
                    for client in list(frontend_clients):
                        try:
                            await client.send_text(msg)
                        except:
                            if client not in dead:
                                dead.append(client)

                for c in dead:
                    frontend_clients.discard(c)

        except WebSocketDisconnect:
            print("[WS] process client disconnected")
            break
        except Exception:
            traceback.print_exc()
            await asyncio.sleep(0.01)
            continue
