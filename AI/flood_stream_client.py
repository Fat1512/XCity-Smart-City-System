import asyncio
import websockets
import json
import cv2
import time
import os
import pathlib
import traceback


CONFIG_PATH = "config/flood_stream.json"


async def run_stream(video_path: str, stream_id: str, ws_url: str = "ws://localhost:8000/ws/process/flood", fps: int = 1):
    """
    - Open video
    - Send init JSON (includes fps)
    - Send frames at interval = 1.0 / fps
    """
    if not os.path.exists(video_path):
        print(f"[{stream_id}] ❌ Video not found:", video_path)
        return

    # sanitize fps
    try:
        fps_val = float(fps)
        if fps_val <= 0:
            print(f"[{stream_id}] ⚠ Invalid fps {fps}; default to 1")
            fps_val = 1.0
    except Exception:
        fps_val = 1.0

    frame_interval = 1.0 / fps_val

    print(f"[{stream_id}] ▶ Connecting to {ws_url} | fps={fps_val} (interval={frame_interval:.3f}s)")

    try:
        async with websockets.connect(ws_url, ping_interval=None, max_size=None) as ws:

            # send init message with fps
            init = {"stream_id": stream_id, "fps": fps_val}
            await ws.send(json.dumps(init))
            print(f"[{stream_id}] ✔ Sent init:", init)

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"[{stream_id}] ❌ Cannot open video:", video_path)
                return

            print(f"[{stream_id}] ▶ Streaming video…")

            frame_index = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    # loop video to keep streaming
                    print(f"[{stream_id}] 🔁 End of video, restarting…")
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
                    print(f"[{stream_id}] ❌ Send error: {e}")
                    raise

                # non-blocking attempt to read ack (short timeout)
                try:
                    ack = await asyncio.wait_for(ws.recv(), timeout=min(0.12, frame_interval))
                    # print only small ack strings to avoid noise
                    if isinstance(ack, str) and len(ack) < 500:
                        print(f"[{stream_id}] ack: {ack}")
                except asyncio.TimeoutError:
                    pass
                except Exception:
                    raise

                # wait according to fps
                await asyncio.sleep(frame_interval)

    except Exception as e:
        print(f"[{stream_id}] ❌ ERROR:", e)
        traceback.print_exc()


# ============================
# Multi-stream runner (giữ đơn giản như yêu cầu)
# ============================
async def main():
    # Load config
    if not os.path.exists(CONFIG_PATH):
        print("❌ Missing config file:", CONFIG_PATH)
        return

    try:
        config = json.loads(open(CONFIG_PATH, "r").read())
    except Exception as e:
        print("❌ Failed to load config:", e)
        return

    if not isinstance(config, list):
        print("❌ Config must be a list of stream configs")
        return

    tasks = []

    for entry in config:
        video_path = entry.get("video_path")
        stream_id = entry.get("stream_id")
        fps = entry.get("fps", 1)
        ws_url = entry.get("ws_url", "ws://localhost:8000/ws/process/flood")

        if not video_path or not stream_id:
            print("⚠ Skipping invalid config entry:", entry)
            continue

        # create task with fps passed through
        tasks.append(asyncio.create_task(
            run_stream(video_path, stream_id, ws_url, fps)
        ))

    print(f"🚀 Running {len(tasks)} streams from config…")
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
