import asyncio
import json
import os
import time
from typing import Any, Dict, Optional

from components.logging.logger import setup_logger

import cv2
import websockets

DEFAULT_CONFIG_PATH = "config/streams_config.json"
DEFAULT_WS = f"ws://{os.getenv('HOST')}/ws/process"

logger = setup_logger("client_traffic")

async def run_stream(
    config: Dict[str, Any],
    ws_url: str,
    semaphore: Optional[asyncio.Semaphore] = None,
) -> None:
    stream_id = config.get("stream_id", "default")
    video_path = config.get("video_path")
    limit_fps = float(config.get("limit_fps", 0))

    if not video_path or not os.path.exists(video_path):
        logger.info(f"[{stream_id}] video_path missing or not exists: {video_path}")
        return

    if semaphore is None:
        class _Noop:
            async def __aenter__(self): return None
            async def __aexit__(self, exc_type, exc, tb): return False
        sem_ctx = _Noop()
    else:
        sem_ctx = semaphore

    async with sem_ctx:
        logger.info(f"[{stream_id}] ▶ connecting to {ws_url}  (video={video_path})")
        try:
            async with websockets.connect(ws_url, ping_interval=None, max_size=None) as ws:
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    logger.info(f"[{stream_id}] ❌ Cannot open video {video_path}")
                    return

                video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

                if limit_fps and limit_fps > 0:
                    send_fps = min(limit_fps, video_fps)
                else:
                    send_fps = video_fps

                init_cfg = {
                    "stream_id": stream_id,
                    "image_pts": config.get("image_pts"),
                    "world_pts": config.get("world_pts"),
                    "classes": config.get("classes"),
                    "conf": config.get("conf", 0.35),
                    "tracker_cfg": config.get("tracker_cfg"),
                    "yolo_weights": config.get("yolo_weights"),
                    "fps": send_fps,
                    "address": config.get("address"),
                }

                await ws.send(json.dumps(init_cfg))
                logger.info(f"[{stream_id}] ✔ video_fps={video_fps}, send_fps={send_fps}")

                frame_interval = 1.0 / video_fps
                sample_step = video_fps / float(send_fps) if send_fps < video_fps else 1.0
                acc = 0.0
                last_time = time.time()

                while True:
                    ret, frame = cap.read()
                    if not ret:
                        logger.info(f"[{stream_id}] ℹ End of video reached.")
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
                            logger.info(f"[{stream_id}] ❌ send error: {e}")
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
                    await ws.send(json.dumps({"action": "stop"}))
                except Exception:
                    pass

        except Exception as e:
            logger.info(f"[{stream_id}] connection failed: {e}")


async def main(
    config_path: str = DEFAULT_CONFIG_PATH,
    ws_url: str = DEFAULT_WS,
    concurrency: int = 4,
) -> int:
    if not os.path.exists(config_path):
        logger.info("Config file not found:", config_path)
        return 1

    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        logger.info("Config file must contain a JSON array of stream objects.")
        return 1

    semaphore = asyncio.Semaphore(concurrency) if concurrency and concurrency > 0 else None
    tasks = [run_stream(cfg, ws_url, semaphore) for cfg in data]

    logger.info(f"Running {len(tasks)} traffic streams…")
    await asyncio.gather(*tasks)
    return 0


if __name__ == "__main__":
    import sys
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code or 0)
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(0)
