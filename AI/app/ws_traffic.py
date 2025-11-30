from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import base64
import json
import traceback
from typing import Dict, Set, Optional, Any
import numpy as np
import cv2
import time

from service.vehicle_speed_stream_service import VehicleSpeedStreamService
from app.utils import publish_to_orion_ld
from app.utils import traffic_state
from app.utils import traffic_media


router = APIRouter()

_services_by_stream: Dict[str, VehicleSpeedStreamService] = {}
_process_clients_by_stream: Dict[str, Set[WebSocket]] = {}
_frontend_clients_by_stream: Dict[str, Set[WebSocket]] = {}
_global_frontend_clients: Set[WebSocket] = set()
_segments_by_stream: Dict[str, list] = {}

_services_lock = asyncio.Lock()
_clients_lock = asyncio.Lock()





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

        stream_id = cfg.get("stream_id")
        segment_ids = cfg.get("segment_ids") or cfg.get("segment_id") or []
        if isinstance(segment_ids, str):
            segment_ids = [segment_ids]
        
        _segments_by_stream[stream_id] = segment_ids

        svc = await get_or_create_service(stream_id)

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

        metrics_interval = 5.0
        last_metrics_time = 0.0
        last_metrics_data: Optional[Dict[str, Any]] = None

        async def _send_bytes_to_client(client: WebSocket, data: bytes):
            try:
                await client.send_bytes(data)
            except Exception:
                async with _clients_lock:
                    _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), client)
                    _safe_discard(_global_frontend_clients, client)

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
                        except Exception:
                            jpg_bytes = payload

                        arr = np.frombuffer(jpg_bytes, dtype=np.uint8)
                        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
                    except Exception:
                        frame = None

                    if frame is None:
                        continue

                    try:
                        annotated_frame, metrics = svc.process_frame(frame)
                    except Exception:
                        continue
                    try:
                        speed_kmh = None
                        if isinstance(metrics, dict):
                            if "avg_speed_kmh" in metrics:
                                speed_kmh = float(metrics["avg_speed_kmh"])
                            elif "avg_speed_mps" in metrics:
                                speed_kmh = float(metrics["avg_speed_mps"]) * 3.6
                            elif "current_avg_speed" in metrics:
                                speed_kmh = float(metrics["current_avg_speed"])

                        if speed_kmh is not None:
                            seg_ids = _segments_by_stream.get(stream_id, [])
                            # print(f"[traffic] stream={stream_id} seg_ids={seg_ids} speed_kmh={speed_kmh}")
                            for seg_id in seg_ids:
                                traffic_state.update_segment_speed(seg_id, speed_kmh)
                    except Exception:
                        pass

                    ok, encoded = cv2.imencode(".jpg", annotated_frame)
                    if not ok:
                        continue
                    jpg_out = encoded.tobytes()
                    traffic_media.update_frame(stream_id, jpg_out)

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
                        print("OK")

                    now = time.time()

                    send_new_metrics = (now - last_metrics_time) >= metrics_interval

                    if send_new_metrics:
                        last_metrics_time = now
                        last_metrics_data = metrics
                        # publish lên Orion cũng 5s/lần
                        try:
                            publish_to_orion_ld(stream_id, metrics)
                        except Exception:
                            pass

                    metrics_for_frontend = last_metrics_data if last_metrics_data is not None else metrics

                    meta = {
                        "type": "frame",
                        "stream_id": stream_id,
                        "ts": int(time.time() * 1000),
                        "metrics": metrics_for_frontend,
                    }

                    meta_bytes = json.dumps(meta).encode("utf-8")
                    import struct
                    header = struct.pack(">I", len(meta_bytes))
                    combined_payload = header + meta_bytes + jpg_out

                    async with _clients_lock:
                        recipients = list(_frontend_clients_by_stream.get(stream_id, set())) + list(_global_frontend_clients)

                    for client in recipients:
                        asyncio.create_task(_send_bytes_to_client(client, combined_payload))

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
