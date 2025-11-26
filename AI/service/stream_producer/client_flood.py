import asyncio
import json
import os
import traceback
from typing import Any, Dict, List

import cv2
import websockets

from components.logging.logger import setup_logger

CONFIG_PATH = os.getenv("FLOOD_CONFIG_PATH", "config/flood_stream.json")
DEFAULT_WS = f"ws://{os.getenv('HOST')}/ws/process/flood"

logger = setup_logger("client_flood")

async def run_stream(
    video_path: str,
    stream_id: str,
    ws_url: str = DEFAULT_WS,
    fps: float = 1.0,
) -> None:
    if not os.path.exists(video_path):
        logger.info(f"[{stream_id}] Video not found: {video_path}")
        return

    try:
        fps_val = float(fps)
        if fps_val <= 0:
            logger.info(f"[{stream_id}] Invalid fps {fps}; default to 1")
            fps_val = 1.0
    except Exception:
        fps_val = 1.0

    frame_interval = 1.0 / fps_val
    logger.info(f"[{stream_id}] Connecting to {ws_url} | fps={fps_val} (interval={frame_interval:.3f}s)")

    try:
        async with websockets.connect(ws_url, ping_interval=None, max_size=None) as ws:
            init = {"stream_id": stream_id, "fps": fps_val}
            await ws.send(json.dumps(init))
            logger.info(f"[{stream_id}] Sent init: {init}")

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                logger.info(f"[{stream_id}] Cannot open video: {video_path}")
                return

            logger.info(f"[{stream_id}] Streaming video...")
            frame_index = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    logger.info(f"[{stream_id}] End of video, restarting...")
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue

                ok, jpg = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
                if not ok:
                    await asyncio.sleep(frame_interval)
                    continue

                try:
                    await ws.send(jpg.tobytes())
                    frame_index += 1
                except Exception as e:
                    logger.info(f"[{stream_id}] Send error: {e}")
                    raise

                try:
                    ack = await asyncio.wait_for(ws.recv(), timeout=min(0.12, frame_interval))
                    if isinstance(ack, str) and len(ack) < 500:
                        logger.info(f"[{stream_id}] ack: {ack}")
                except asyncio.TimeoutError:
                    pass
                except Exception:
                    raise

                await asyncio.sleep(frame_interval)

    except Exception as e:
        logger.info(f"[{stream_id}] ERROR: {e}")
        # traceback.logger.info_exc() # Removed the comment, but kept the traceback call if it was intended to be uncommented
        traceback.print_exc()


async def main(config_path: str = CONFIG_PATH) -> None:
    if not os.path.exists(config_path):
        logger.info("Missing config file:", config_path)
        return

    try:
        config = json.loads(open(config_path, "r").read())
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
        ws_url = entry.get("ws_url", DEFAULT_WS)

        if not video_path or not stream_id:
            logger.info("Skipping invalid config entry:", entry)
            continue

        tasks.append(asyncio.create_task(run_stream(video_path, stream_id, ws_url, fps)))

    logger.info(f"Running {len(tasks)} flood streams from config...")
    if tasks:
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())