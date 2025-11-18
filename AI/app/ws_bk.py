from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import base64
import numpy as np
import cv2
import json, traceback
import asyncio
from service.vehicle_speed_stream_service import VehicleSpeedStreamService

router = APIRouter()

speed_service = VehicleSpeedStreamService()

frontend_clients: set[WebSocket] = set()


@router.websocket("/ws/frontend")
async def frontend_ws(ws: WebSocket):
    await ws.accept()
    frontend_clients.add(ws)
    print(f"[WS] frontend client connected (total={len(frontend_clients)})")
    try:
        while True:
            try:
                msg = await ws.receive_text()
            except Exception:
                try:
                    await ws.receive_bytes()
                except Exception:
                    await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass
    finally:
        if ws in frontend_clients:
            frontend_clients.remove(ws)
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
    while True:
        try:
            raw = await ws.receive_bytes()
            b64 = raw.decode("utf-8")
            jpg_bytes = base64.b64decode(b64)
            arr = np.frombuffer(jpg_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)

            if frame is None:
                print("[WS] received invalid frame")
                continue

            # Process frame and get metrics
            processed, metrics = speed_service.process_frame(frame)
            frame_count += 1

            ok, encoded = cv2.imencode(".jpg", processed)
            if not ok:
                print("[WS] failed to encode processed frame")
                continue
            jpg_bytes_out = encoded.tobytes()

            # Send processed frame back to sender
            try:
                out64 = base64.b64encode(jpg_bytes_out).decode("utf-8")
                await ws.send_text(out64)
            except Exception as e:
                print(f"[WS] warning: failed to send back to sender: {e}")

            # Broadcast to frontend clients with metrics
            if frontend_clients:
                dead_clients = []
                
                # Send image
                for client in list(frontend_clients):
                    try:
                        await client.send_bytes(jpg_bytes_out)
                    except Exception as e:
                        print(f"[WS] removing frontend client due to send error: {e}")
                        dead_clients.append(client)
                
                # Send metrics every 5 frames (to reduce traffic)
                if frame_count % 5 == 0:
                    metrics_msg = json.dumps({
                        "type": "metrics",
                        "data": metrics
                    })
                    for client in list(frontend_clients):
                        try:
                            await client.send_text(metrics_msg)
                        except Exception as e:
                            print(f"[WS] failed to send metrics: {e}")
                            if client not in dead_clients:
                                dead_clients.append(client)
                
                for c in dead_clients:
                    if c in frontend_clients:
                        frontend_clients.remove(c)

        except WebSocketDisconnect:
            print("[WS] process client disconnected")
            break
        except Exception as e:
            print(f"[WS] processing loop error: {e}")
            traceback.print_exc()
            await asyncio.sleep(0.01)
            continue