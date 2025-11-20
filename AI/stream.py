#!/usr/bin/env python3
import asyncio
import websockets
import argparse
import json
import cv2
import base64
import os
import time
import sys
from typing import Dict, Any, List

DEFAULT_CONFIG_PATH = "config/streams_config.json"
DEFAULT_WS = "ws://localhost:8000/ws/process"

async def run_stream(config: Dict[str, Any], ws_url: str, semaphore: asyncio.Semaphore = None):
    stream_id = config.get("stream_id", "default")
    video_path = config.get("video_path")
    limit_fps = float(config.get("limit_fps", 0))

    if not video_path or not os.path.exists(video_path):
        print(f"[{stream_id}] ERROR: video_path missing or not exists: {video_path}")
        return

    if semaphore is None:
        class _Noop:
            async def __aenter__(self): return None
            async def __aexit__(self, exc_type, exc, tb): return False
        sem_ctx = _Noop()
    else:
        sem_ctx = semaphore

    async with sem_ctx:
        print(f"[{stream_id}] connecting to {ws_url}  (video={video_path})")
        try:
            async with websockets.connect(ws_url, ping_interval=None, max_size=None) as ws:
                # open video to detect fps
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    print(f"[{stream_id}] Cannot open video {video_path}")
                    return
                video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

                # decide sending fps: if limit_fps provided and >0, use min(limit_fps, video_fps)
                if limit_fps and limit_fps > 0:
                    send_fps = min(limit_fps, video_fps)
                else:
                    send_fps = video_fps

                # prepare init config and include the detected fps
                init_cfg = {
                    "stream_id": stream_id,
                    "image_pts": config.get("image_pts"),
                    "world_pts": config.get("world_pts"),
                    "classes": config.get("classes"),
                    "conf": config.get("conf", 0.35),
                    "tracker_cfg": config.get("tracker_cfg"),
                    "yolo_weights": config.get("yolo_weights"),
                    # use detected send_fps here (not the config fps)
                    "fps": send_fps,
                    "address": config.get("address")
                }

                # send init (text JSON)
                await ws.send(json.dumps(init_cfg))

                print(f"[{stream_id}] video_fps={video_fps}, send_fps={send_fps}")

                frame_interval = 1.0 / video_fps
                sample_step = video_fps / float(send_fps) if send_fps < video_fps else 1.0
                acc = 0.0
                last_time = time.time()

                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print(f"[{stream_id}] End of video reached.")
                        break
                    acc += 1.0
                    if acc >= sample_step:
                        acc -= sample_step
                        ok, jpg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                        if not ok:
                            continue
                        jpg_bytes = jpg.tobytes()
                        try:
                            await ws.send(jpg_bytes)
                        except Exception as e:
                            print(f"[{stream_id}] send error: {e}")
                            break

                        try:
                            recv_task = asyncio.create_task(ws.recv())
                            done, pending = await asyncio.wait([recv_task], timeout=0.01)
                            if done:
                                _ = recv_task.result()
                            else:
                                for p in pending:
                                    p.cancel()
                        except Exception:
                            pass

                    now = time.time()
                    sleep_for = frame_interval - (now - last_time)
                    if sleep_for > 0:
                        await asyncio.sleep(sleep_for)
                    last_time = time.time()

                cap.release()
                try:
                    await ws.send(json.dumps({"action":"stop"}))
                except Exception:
                    pass

        except Exception as e:
            print(f"[{stream_id}] connection failed: {e}")

async def main(config_path: str, ws_url: str, concurrency: int):
    if not os.path.exists(config_path):
        print("Config file not found:", config_path)
        return 1

    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("Config file must contain a JSON array of stream objects.")
        return 1

    semaphore = asyncio.Semaphore(concurrency) if concurrency and concurrency > 0 else None
    tasks = []
    for cfg in data:
        tasks.append(run_stream(cfg, ws_url, semaphore))

    await asyncio.gather(*tasks)
    return 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate multiple video streams via websocket using a JSON config list.")
    parser.add_argument("--config", "-c", default=DEFAULT_CONFIG_PATH, help="Path to JSON config file (array of stream objects).")
    parser.add_argument("--ws", default=DEFAULT_WS, help="Websocket process endpoint (producer): e.g. ws://localhost:8000/ws/process")
    parser.add_argument("--concurrency", "-n", type=int, default=4, help="Max concurrent active producers (useful to limit resource usage).")
    args = parser.parse_args()

    try:
        exit_code = asyncio.run(main(args.config, args.ws, args.concurrency))
        sys.exit(exit_code or 0)
    except KeyboardInterrupt:
        print("Interrupted by user")
        sys.exit(0)
