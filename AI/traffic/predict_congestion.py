import time
from collections import deque
from ultralytics import YOLO
import cv2
import numpy as np

# ==== Cấu hình ====
MODEL = "yolov8x.pt"        # hoặc yolov8s/yolov8m nếu bạn có GPU
VEHICLE_CLASSES = {"car", "truck", "bus", "motorcycle", "bicycle"}  # tên lớp model trả về
FRAME_WINDOW = 10           # số frame để tính moving avg (ví dụ 10 frames ~ 10*interval s)
OCCUPANCY_THRESH_WARN = 0.25
OCCUPANCY_THRESH_HEAVY = 0.45
COUNT_THRESH = 20
# ==================

# load model
model = YOLO(MODEL)  # sẽ tải model lần đầu (cần internet), sau đó dùng local cache

def frame_metrics(frame):
    """Detect vehicles and compute count and occupancy"""
    # model expects BGR images (opencv)
    results = model(frame, imgsz=1280, conf=0.15, iou=0.5, verbose=False)# results is list-like
    # take first result
    r = results[0]
    boxes = r.boxes  # Boxes object
    h, w = frame.shape[:2]
    total_area = w * h

    vehicle_bboxes = []
    for box, cls in zip(boxes.xyxy.cpu().numpy(), boxes.cls.cpu().numpy()):
        # get class name
        class_id = int(cls)
        cls_name = model.names[class_id]
        if cls_name in VEHICLE_CLASSES:
            x1, y1, x2, y2 = box
            area = max(0, x2 - x1) * max(0, y2 - y1)
            vehicle_bboxes.append((int(x1), int(y1), int(x2), int(y2), area))

    count = len(vehicle_bboxes)
    occupancy = sum([a for *_, a in vehicle_bboxes]) / total_area if total_area > 0 else 0.0
    return count, occupancy, vehicle_bboxes

def congestion_decision(moving_counts, moving_occupancies):
    """Return severity: 0=free,1=warn,2=heavy and a score 0..1"""
    avg_count = sum(moving_counts) / len(moving_counts)
    avg_occ = sum(moving_occupancies) / len(moving_occupancies)
    score = min(1.0, avg_occ / OCCUPANCY_THRESH_HEAVY)  # simple score
    severity = 0
    if avg_occ >= OCCUPANCY_THRESH_HEAVY or avg_count >= (2*COUNT_THRESH):
        severity = 2
    elif avg_occ >= OCCUPANCY_THRESH_WARN or avg_count >= COUNT_THRESH:
        severity = 1
    else:
        severity = 0
    return severity, score, avg_count, avg_occ

def run_on_stream(frame_fetcher, fetch_interval_sec=10.0):
    """
    frame_fetcher() -> returns (frame, mtime) hoặc None nếu không có frame.
    Chỉ xử lý khi file cập nhật mới (mtime thay đổi).
    """
    last_counts = deque(maxlen=FRAME_WINDOW)
    last_occs = deque(maxlen=FRAME_WINDOW)
    last_mtime = 0

    while True:
        result = frame_fetcher()
        if result is None:
            time.sleep(fetch_interval_sec)
            continue

        frame, mtime = result
        if mtime == last_mtime:
            # file chưa đổi, đợi thêm
            time.sleep(fetch_interval_sec)
            continue
        last_mtime = mtime

        t0 = time.time()
        count, occ, boxes = frame_metrics(frame)
        last_counts.append(count)
        last_occs.append(occ)
        severity, score, avg_count, avg_occ = congestion_decision(last_counts, last_occs)

        label = {0: "FREE", 1: "SLOW/WARN", 2: "CONGESTED"}[severity]
        print(f"[{time.strftime('%H:%M:%S')}] count={count} occ={occ:.3f} avg_occ={avg_occ:.3f} -> {label}")

        # vẽ debug nếu cần
        for (x1, y1, x2, y2, _) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(frame, f"{label} {score:.2f}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)
        cv2.imshow("cam", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

        # đảm bảo không xử lý sớm hơn collector
        elapsed = time.time() - t0
        time.sleep(max(0, fetch_interval_sec - elapsed))

    cv2.destroyAllWindows()


# -----------------------
# Example frame_fetcher: read from folder of latest.jpg created by your collector
import os
def file_frame_fetcher(latest_path):
    """Mỗi lần gọi, đọc latest_path và trả (frame, mtime)"""
    def fetch():
        try:
            mtime = os.path.getmtime(latest_path)
            frame = cv2.imread(latest_path)
            return frame, mtime
        except FileNotFoundError:
            return None
    return fetch


if __name__ == "__main__":
    # use your collector's symlink: data/<camera>/latest.jpg
    # camera_latest = "./data/LyThuongKiet_ToHienThanh_2/latest.jpg"
    camera_latest = "example.jpg"
    fetcher = file_frame_fetcher(camera_latest)
    run_on_stream(fetcher)
