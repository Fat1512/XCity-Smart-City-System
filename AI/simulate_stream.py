import cv2
import asyncio
import websockets
import base64
import json
import numpy as np
import time

WS_URL = "ws://localhost:8000/ws/process"
VIDEO_PATH = "video.mp4"

# config gửi 1 lần khi mở WS
# 32 chiều rộng, 140 chiều dài
INIT_CONFIG = {
    "image_pts": [(800, 410), (1125, 410), (1920, 850), (0, 850)],
    "world_pts": [(0, 0), (32, 0), (32, 140), (0, 140)],
    # "image_pts": [(204, 379), (531, 305), (920, 490), (396, 716)],
    # "world_pts": [(0, 0), (10, 0), (10, 30), (0, 30)],
    "classes": [2,3,5,6],        # car, motorcycle, bus, truck
    "conf": 0.35,
    "tracker_cfg": "bytetrack.yaml",
    "fps": 5
}

# ===== TÙY CHỌN =====
LIMIT_FPS = 5   # target FPS muốn gửi xuống backend (None = dùng fps gốc)
# ====================

async def run_stream():
    # mở video trước để biết video_fps, rồi set INIT_CONFIG["fps"] theo LIMIT_FPS
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {VIDEO_PATH}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    if not video_fps or video_fps <= 0:
        # fallback nếu file ko có metadata fps
        video_fps = 30.0

    # quyết định send_fps: nếu LIMIT_FPS None hoặc >= video_fps -> gửi bằng video_fps
    # ngược lại gửi bằng LIMIT_FPS
    if LIMIT_FPS is None or LIMIT_FPS >= video_fps:
        send_fps = video_fps
    else:
        send_fps = float(LIMIT_FPS)

    # set vào config trước khi connect
    INIT_CONFIG["fps"] = send_fps
    print(f"Video FPS: {video_fps:.2f} | Sending FPS (init): {send_fps:.2f}")

    # now connect and send init
    async with websockets.connect(WS_URL, ping_interval=None, max_size=None) as ws:
        await ws.send(json.dumps(INIT_CONFIG))
        print("[OK] Init config sent with fps =", INIT_CONFIG["fps"])

        # continue using the same sampling logic as before
        frame_interval = 1.0 / video_fps  # thời gian giữa 2 frame trong file gốc

        if LIMIT_FPS is None or LIMIT_FPS >= video_fps:
            sample_interval = 1.0  # gửi mọi frame (accumulate threshold = 1)
        else:
            sample_interval = video_fps / float(LIMIT_FPS)  # e.g., 30/5 = 6.0

        acc = 0.0
        frame_idx = 0
        last_time = time.time()

        while True:
            ret, frame = cap.read()
            if not ret:
                print("End of video")
                break

            frame_idx += 1
            acc += 1.0

            # decide whether to send this frame
            if acc >= sample_interval:
                acc -= sample_interval  # consume quota

                ok, jpg = cv2.imencode(".jpg", frame)
                if ok:
                    b64 = base64.b64encode(jpg.tobytes())
                    await ws.send(b64)  # send bytes

                    # optionally receive processed result (if server returns one)
                    try:
                        processed = await ws.recv()
                        # handle processed if needed
                    except Exception:
                        # ignore or handle disconnect
                        pass

            # keep playback timing like original video (read pace)
            now = time.time()
            elapsed = now - last_time
            sleep_for = frame_interval - elapsed
            if sleep_for > 0:
                await asyncio.sleep(sleep_for)
            last_time = time.time()

        cap.release()

if __name__ == "__main__":
    asyncio.run(run_stream())