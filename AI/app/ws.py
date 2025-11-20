from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import base64
import json
import traceback
from typing import Dict, Set, Optional, Any, List
import numpy as np
import cv2
import time
import requests
from datetime import datetime, timezone

from service.vehicle_speed_stream_service import VehicleSpeedStreamService

router = APIRouter()

_services_by_stream: Dict[str, VehicleSpeedStreamService] = {}
_process_clients_by_stream: Dict[str, Set[WebSocket]] = {}
_frontend_clients_by_stream: Dict[str, Set[WebSocket]] = {}
_global_frontend_clients: Set[WebSocket] = set()

_services_lock = asyncio.Lock()
_clients_lock = asyncio.Lock()

_address_by_stream: Dict[str, Dict[str, Any]] = {}

ORION_URL = "http://localhost:1026"
FIWARE_SERVICE = "openiot"


async def get_or_create_service(stream_id: str) -> VehicleSpeedStreamService:
    async with _services_lock:
        svc = _services_by_stream.get(stream_id)
        if svc is None:
            svc = VehicleSpeedStreamService()
            _services_by_stream[stream_id] = svc
        return svc


def _safe_discard(ws_set: Set[WebSocket], ws: WebSocket):
    try:
        ws_set.discard(ws)
    except Exception:
        pass


def publish_to_orion_ld(sensor_id: str, metrics: dict, address: Optional[dict] = None) -> bool:
    import logging
    logger = logging.getLogger("ws.orion.upsert")

    if not address or not isinstance(address, dict):
        logger.error(f"[ORION UPSERT] Missing required address for stream_id={sensor_id}")
        return False

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
        return o

    try:
        observed_at = datetime.now(timezone.utc).isoformat()

        entity_id = f"urn:ngsi-ld:TrafficFlowObserved:{sensor_id}"
        entity_type = "TrafficFlowObserved"

        attrs = {
            "address": {
                "type": "Property",
                "value": to_native(address)
            }
        }

        attrs["averageVehicleSpeed"] = {
            "type": "Property",
            "value": to_native(metrics.get("current_avg_speed"))
        }

        attrs["intensity"] = {
            "type": "Property",
            "value": to_native(metrics.get("current_count"))
        }

        attrs["dateObserved"] = {
            "type": "Property",
            "value": observed_at
        }

        entity_body = {
            "id": entity_id,
            "type": entity_type,
            "@context": [
                "https://smart-data-models.github.io/dataModel.Transportation/context.jsonld",
                "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
            ],
            **attrs
        }

        payload = [entity_body]

        upsert_url = ORION_URL.rstrip("/") + "/ngsi-ld/v1/entityOperations/upsert"

        headers = {
            "Content-Type": "application/ld+json",
            "Fiware-Service": FIWARE_SERVICE,
            "Fiware-ServicePath": "/"
        }

        resp = requests.post(upsert_url, json=payload, headers=headers, timeout=8)

        return resp.status_code in (200, 201, 204)

    except Exception:
        logger.exception("[ORION UPSERT] Unexpected error")
        return False


@router.websocket("/ws/frontend")
async def frontend_ws(websocket: WebSocket):
    await websocket.accept()
    stream_id: Optional[str] = None
    try:
        try:
            raw = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
            j = json.loads(raw)
            if j.get("action") == "subscribe":
                stream_id = j.get("stream_id")
        except:
            stream_id = None

        async with _clients_lock:
            if stream_id:
                _frontend_clients_by_stream.setdefault(stream_id, set()).add(websocket)
            else:
                _global_frontend_clients.add(websocket)

        while True:
            msg = await websocket.receive_text()
            try:
                j = json.loads(msg)
                if j.get("action") == "subscribe":
                    new_stream = j.get("stream_id")
                    async with _clients_lock:
                        if stream_id and websocket in _frontend_clients_by_stream.get(stream_id, set()):
                            _frontend_clients_by_stream[stream_id].discard(websocket)
                        if websocket in _global_frontend_clients:
                            _global_frontend_clients.discard(websocket)
                        stream_id = new_stream
                        if stream_id:
                            _frontend_clients_by_stream.setdefault(stream_id, set()).add(websocket)
                        else:
                            _global_frontend_clients.add(websocket)
            except:
                await asyncio.sleep(0.1)

    except WebSocketDisconnect:
        pass
    finally:
        async with _clients_lock:
            if stream_id:
                _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), websocket)
            else:
                _safe_discard(_global_frontend_clients, websocket)


@router.websocket("/ws/process")
async def process_ws(websocket: WebSocket):
    await websocket.accept()
    stream_id: str = "default"
    svc: Optional[VehicleSpeedStreamService] = None

    try:
        try:
            init_msg = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
            cfg = json.loads(init_msg)
        except:
            await websocket.close(code=1003)
            return

        stream_id = cfg.get("stream_id", "default")
        svc = await get_or_create_service(stream_id)

        if cfg.get("address"):
            _address_by_stream[stream_id] = cfg.get("address")

        try:
            svc.init_stream(
                image_pts=cfg.get("image_pts"),
                world_pts=cfg.get("world_pts"),
                classes=cfg.get("classes"),
                conf=cfg.get("conf", 0.35),
                tracker_cfg=cfg.get("tracker_cfg"),
                yolo_weights=cfg.get("yolo_weights"),
                fps=cfg.get("fps", 30),
            )
        except:
            traceback.print_exc()
            await websocket.close(code=1011)
            return

        async with _clients_lock:
            _process_clients_by_stream.setdefault(stream_id, set()).add(websocket)

        frame_count = 0
        publish_interval = 10

        while True:
            msg = await websocket.receive()
            msg_type = msg.get("type")

            if msg_type == "websocket.disconnect":
                raise WebSocketDisconnect()

            if msg_type == "websocket.receive":
                if "bytes" in msg:
                    payload = msg["bytes"]

                    try:
                        try:
                            b64text = payload.decode("utf-8")
                            jpg_bytes = base64.b64decode(b64text)
                        except:
                            jpg_bytes = payload

                        arr = np.frombuffer(jpg_bytes, dtype=np.uint8)
                        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                    except:
                        frame = None

                    if frame is None:
                        continue

                    try:
                        annotated_frame, metrics = svc.process_frame(frame)
                    except:
                        continue

                    ok, encoded = cv2.imencode(".jpg", annotated_frame)
                    if not ok:
                        continue
                    jpg_out = encoded.tobytes()

                    try:
                        await websocket.send_text(json.dumps({
                            "type": "ack",
                            "metrics": {
                                "stream_id": stream_id,
                                "ts": int(time.time() * 1000),
                                "metrics": metrics
                            }
                        }))
                    except:
                        pass

                    async with _clients_lock:
                        recipients = list(_frontend_clients_by_stream.get(stream_id, set())) + list(_global_frontend_clients)

                    for client in recipients:
                        try:
                            await client.send_bytes(jpg_out)
                        except:
                            async with _clients_lock:
                                _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), client)
                                _safe_discard(_global_frontend_clients, client)

                    metrics_payload = {
                        "type": "metrics",
                        "stream_id": stream_id,
                        "ts": int(time.time() * 1000),
                        "metrics": metrics
                    }

                    for client in recipients:
                        try:
                            await client.send_text(json.dumps(metrics_payload))
                        except:
                            async with _clients_lock:
                                _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), client)
                                _safe_discard(_global_frontend_clients, client)

                    frame_count += 1
                    if frame_count % publish_interval == 0:
                        addr = _address_by_stream.get(stream_id)
                        publish_to_orion_ld(stream_id, metrics, address=addr)

                elif "text" in msg:
                    try:
                        if json.loads(msg["text"]).get("action") == "stop":
                            break
                    except:
                        pass

    except WebSocketDisconnect:
        pass
    finally:
        async with _clients_lock:
            _safe_discard(_process_clients_by_stream.get(stream_id, set()), websocket)


@router.get("/ws/active_streams")
async def list_active_streams():
    async with _services_lock:
        keys = list(_services_by_stream.keys())
    return {"streams": keys}
