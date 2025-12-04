# -----------------------------------------------------------------------------
# Copyright 2025 Fenwick Team
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# -----------------------------------------------------------------------------
import asyncio
import json
import os
import cv2
import websockets
import time
from typing import Any, Dict, List, Optional

from components.logging.logger import setup_logger

CONFIG_PATH = os.getenv("FLOOD_CONFIG_PATH", "config/flood_stream.json")
DEFAULT_WS = f"ws://{os.getenv('AI_HOST')}/ws/process/flood"

logger = setup_logger("client_flood")


async def run_stream(
    config: Dict[str, Any],
    ws_url: str,
    semaphore: Optional[asyncio.Semaphore] = None,
) -> None:
    stream_id = config.get("stream_id", "default")
    video_path = config.get("video_path")
    limit_fps = float(config.get("limit_fps", 0))

    if not video_path or not os.path.exists(video_path):
        logger.info(f"[{stream_id}] video_path not found: {video_path}")
        return

    if semaphore is None:
        class _Noop:
            async def __aenter__(self): return None
            async def __aexit__(self, exc_type, exc, tb): return False
        sem_ctx = _Noop()
    else:
        sem_ctx = semaphore

    async with sem_ctx:
        logger.info(f"[{stream_id}] Connecting to {ws_url} (video={video_path})")

        try:
            async with websockets.connect(ws_url, ping_interval=None, max_size=None) as ws:
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    logger.info(f"[{stream_id}] Cannot open video {video_path}")
                    return

                video_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                send_fps = min(limit_fps, video_fps) if limit_fps > 0 else video_fps

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
                logger.info(f"[{stream_id}] video_fps={video_fps}, send_fps={send_fps}")

                frame_interval = 1.0 / video_fps
                sample_step = video_fps / send_fps if send_fps < video_fps else 1.0

                acc = 0.0
                last_time = time.time()

                while True:
                    ret, frame = cap.read()

                    if not ret:
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        acc = 0.0
                        last_time = time.time()
                        continue

                    acc += 1
                    if acc >= sample_step:
                        acc -= sample_step

                        ok, jpg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                        if not ok:
                            continue

                        try:
                            await ws.send(jpg.tobytes())
                        except Exception as e:
                            logger.info(f"[{stream_id}] send error: {e}")
                            break

                        try:
                            recv = asyncio.create_task(ws.recv())
                            done, pending = await asyncio.wait([recv], timeout=0.01)
                            if not done:
                                for p in pending: p.cancel()
                        except:
                            pass

                    now = time.time()
                    sleep_for = frame_interval - (now - last_time)
                    if sleep_for > 0:
                        await asyncio.sleep(sleep_for)

                    last_time = time.time()

                cap.release()
                try:
                    await ws.send(json.dumps({"action": "stop"}))
                except:
                    pass

        except Exception as e:
            logger.info(f"[{stream_id}] connection failed: {e}")


async def main(config_path: str = CONFIG_PATH) -> None:
    if not os.path.exists(config_path):
        logger.info("Missing config file:", config_path)
        return

    try:
        config = json.loads(open(config_path).read())
    except Exception as e:
        logger.info("Failed to load config:", e)
        return

    if not isinstance(config, list):
        logger.info("Config must be a list of stream configs")
        return

    tasks: List[asyncio.Task] = []

    for entry in config:
        video_path = entry.get("video_path")
        stream_id = entry.get("stream_id")
        fps = entry.get("fps", 1)
        ws_url = DEFAULT_WS

        if not video_path or not stream_id:
            logger.info("Skipping invalid config entry:", entry)
            continue

        tasks.append(asyncio.create_task(
            run_stream(entry, ws_url)
        ))

    logger.info(f"Running {len(tasks)} flood streams...")
    if tasks:
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())