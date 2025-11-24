from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import base64
import json
import time
import struct
import numpy as np
import cv2
import traceback

from service.flood_stream_service import FloodStreamService

router = APIRouter()

_services_by_stream = {}
_frontend_clients_by_stream = {}
_global_frontend_clients = set()

_services_lock = asyncio.Lock()
_clients_lock = asyncio.Lock()


async def get_or_create_flood_service(stream_id: str) -> FloodStreamService:
    async with _services_lock:
        svc = _services_by_stream.get(stream_id)
        if svc is None:
            svc = FloodStreamService()
            _services_by_stream[stream_id] = svc
        return svc


def _safe_discard(ws_set, ws):
    try:
        ws_set.discard(ws)
    except Exception:
        pass


@router.websocket("/ws/flood/frontend")
async def flood_frontend_ws(websocket: WebSocket):
    await websocket.accept()
    stream_id = None

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


@router.websocket("/ws/process/flood")
async def flood_process_ws(websocket: WebSocket):
    await websocket.accept()
    stream_id = "default"
    svc = None

    try:
        try:
            init_msg = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
            cfg = json.loads(init_msg)
        except Exception as e:
            print(f"Failed to receive init config: {e}")
            await websocket.close(code=1003)
            return

        stream_id = cfg.get("stream_id", "default")
        svc = await get_or_create_flood_service(stream_id)

        try:
            svc.init_stream(fps=cfg.get("fps", 1))
        except Exception as e:
            print(f"Failed to init stream: {e}")
            traceback.print_exc()
            await websocket.close(code=1011)
            return

        async with _clients_lock:
            _frontend_clients_by_stream.setdefault(stream_id, set())

        print(f"Flood stream '{stream_id}' initialized and ready")

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

                    except Exception as e:
                        print(f"Failed to decode frame: {e}")
                        frame = None

                    if frame is None:
                        continue

                    try:
                        annotated_frame, metrics = svc.process_frame(frame)
                    except Exception as e:
                        print(f"Failed to process frame: {e}")
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
                    except Exception as e:
                        print(f"Failed to send ack: {e}")

                    meta = {
                        "type": "frame",
                        "stream_id": stream_id,
                        "ts": int(time.time() * 1000),
                        "metrics": metrics
                    }
                    meta_bytes = json.dumps(meta).encode("utf-8")
                    header = struct.pack(">I", len(meta_bytes))
                    combined_payload = header + meta_bytes + jpg_out

                    async with _clients_lock:
                        recipients = (
                            list(_frontend_clients_by_stream.get(stream_id, set())) +
                            list(_global_frontend_clients)
                        )

                    for client in recipients:
                        try:
                            await client.send_bytes(combined_payload)
                        except Exception:
                            _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), client)
                            _safe_discard(_global_frontend_clients, client)

                elif "text" in msg:
                    try:
                        cmd = json.loads(msg["text"])
                        if cmd.get("action") == "stop":
                            print(f"Stop command received for '{stream_id}'")
                            break
                    except:
                        pass

    except WebSocketDisconnect:
        print(f"Client disconnected from flood stream '{stream_id}'")
    except Exception as e:
        print(f"Error in flood process websocket: {e}")
        traceback.print_exc()

    finally:
        async with _clients_lock:
            _safe_discard(_frontend_clients_by_stream.get(stream_id, set()), websocket)

        print(f"Flood stream '{stream_id}' connection closed")


@router.get("/ws/flood/active_streams")
async def list_active_flood_streams():
    async with _services_lock:
        keys = list(_services_by_stream.keys())
    return {"streams": keys}
