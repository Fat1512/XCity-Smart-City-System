from __future__ import annotations
from typing import List, Tuple, Optional, Dict, Any
from pathlib import Path
import math
import cv2 as cv
import numpy as np
from collections import defaultdict

from ultralytics import YOLO
import supervision as sv

from components.interfaces import Tool

try:
    from .core.cam_mapper import Cam2WorldMapper
    from .core.speedometer import Speedometer, MPS_TO_KPH
except Exception:
    class Cam2WorldMapper:
        def find_perspective_transform(self, a, b): pass

    class Speedometer:
        def __init__(self, mapper, fps, unit=3.6):
            self.speeds = {}
        def update_with_trace(self, track_id, trace):
            self.speeds.setdefault(track_id, []).append(0)
        def get_current_speed(self, track_id):
            return 0

    MPS_TO_KPH = 3.6


class VehicleSpeedTool(Tool):

    name: str = "vehicle_speed_tool"
    description: str = "Detect vehicles, estimate speed, filter inside zone & draw polygon overlay."
    category: str = "traffic"
    enabled: bool = True

    def __init__(self, yolo_weights: str = "yolo11m.pt", detector_weights: str = "yolov8m.pt"):
        self.yolo_weights = yolo_weights
        self.stream_ready = False
        self.model = None
        self.detector_model = None
        self.detector_weights = detector_weights
        self.mapper = None
        self.speedometer = None
        self.zone = None
        self.poly_pts = None
        
        # Metrics tracking for streaming
        self.vehicle_counts = defaultdict(int)
        self.current_speeds = {}
        self.all_speeds = []
        self.tracked_ids = set()

    def init_stream_mode(
        self,
        image_pts,
        world_pts,
        classes=None,
        conf=None,
        tracker_cfg=None,
        yolo_weights=None,
        detector_weights=None,
        fps_override=30,
    ):
        try:
            # Load speed model (tracking model - yolo11m)
            weights_speed = yolo_weights or self.yolo_weights
            self.model = YOLO(weights_speed, task="detect")

            # Load detector model (yolov8m) for better detection
            weights_detector = detector_weights or self.detector_weights
            self.detector_model = YOLO(weights_detector, task="detect")

            # Save stream config
            self.stream_classes = classes or [2, 3, 5, 6]
            self.stream_conf = conf or 0.4
            self.stream_tracker = tracker_cfg or "bytetrack.yaml"
            self.stream_fps = fps_override

            # mapper + speedometer
            self.mapper = Cam2WorldMapper()
            self.mapper.find_perspective_transform(image_pts, world_pts)
            self.speedometer = Speedometer(self.mapper, self.stream_fps, unit=MPS_TO_KPH)

            # Initialize annotators
            self._init_annotators()

            # polygon zone
            poly = np.array(image_pts, dtype=np.int32)
            self.poly_pts = poly.reshape((-1, 1, 2))
            self.zone = sv.PolygonZone(poly, (sv.Position.TOP_CENTER, sv.Position.BOTTOM_CENTER))

            # reset metrics
            self.vehicle_counts = defaultdict(int)
            self.current_speeds = {}
            self.all_speeds = []
            self.tracked_ids = set()

            self.stream_ready = True
            return True
        except Exception as e:
            print(f"Error initializing stream mode: {e}")
            import traceback
            traceback.print_exc()
            self.stream_ready = False
            return False

    def _init_annotators(self):
        """Initialize annotators for stream mode"""
        try:
            colors = ("#007fff", "#0072e6", "#0066cc", "#0059b3", "#004c99", "#004080")
            color_palette = sv.ColorPalette([sv.Color.from_hex(c) for c in colors])
            
            self.class_names = [
                "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck"
            ] + [""] * 72

            self.bbox_annot = sv.BoxAnnotator(
                color=color_palette, 
                thickness=2, 
                color_lookup=sv.ColorLookup.TRACK
            )
            self.trace_annot = sv.TraceAnnotator(
                color=color_palette,
                trace_length=self.stream_fps,
                position=sv.Position.CENTER,
                thickness=2,
                color_lookup=sv.ColorLookup.TRACK
            )
            try:
                self.label_annot = sv.RichLabelAnnotator(
                    color=color_palette,
                    font_size=16,
                    border_radius=3,
                    text_padding=5,
                    color_lookup=sv.ColorLookup.TRACK
                )
            except:
                self.label_annot = sv.LabelAnnotator()
                
        except Exception as e:
            print(f"Error initializing annotators: {e}")
            raise

    def validate_input(self, *args, **kwargs) -> Optional[str]:
        if "source_video" not in kwargs:
            return "Missing source_video"
        if "image_pts" not in kwargs or "world_pts" not in kwargs:
            return "Missing image_pts or world_pts"
        return None

    def get_function_schema(self):
        return {
            "name": self.name,
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "source_video": {"type": "string"},
                    "output_video": {"type": "string"},
                    "image_pts": {"type": "array"},
                    "world_pts": {"type": "array"},
                    "classes": {"type": "array"},
                    "conf": {"type": "number"},
                    "tracker_cfg": {"type": "string"},
                    "imgsz_multiple_of": {"type": "number"},
                    "fps_override": {"type": "number"},
                    "yolo_weights": {"type": "string"},
                },
                "required": ["source_video", "image_pts", "world_pts"],
            },
        }

    def call(
        self,
        source_video: str,
        output_video: Optional[str] = None,
        image_pts: List[Tuple[int, int]] = None,
        world_pts: List[Tuple[float, float]] = None,
        yolo_weights: str = "yolo11m.pt",
        classes: Optional[List[int]] = None,
        conf: float = 0.4,
        tracker_cfg: str = "bytetrack.yaml",
        imgsz_multiple_of: int = 32,
        fps_override: Optional[int] = None,
    ):

        if classes is None:
            classes = [2, 4, 5, 7]

        if output_video is None:
            p = Path(source_video)
            output_video = str(p.with_name(p.stem + "_annotated" + p.suffix))

        mapper = Cam2WorldMapper()
        mapper.find_perspective_transform(image_pts, world_pts)

        model = YOLO(yolo_weights, task="detect")

        video_info = sv.VideoInfo.from_video_path(source_video)
        FPS = int(fps_override or video_info.fps)

        colors = ("#007fff", "#0072e6", "#0066cc", "#0059b3", "#004c99", "#004080")
        color_palette = sv.ColorPalette([sv.Color.from_hex(c) for c in colors])

        bbox_annot = sv.BoxAnnotator(color=color_palette, thickness=2, color_lookup=sv.ColorLookup.TRACK)
        trace_annot = sv.TraceAnnotator(
            color=color_palette,
            trace_length=FPS,
            position=sv.Position.CENTER,
            thickness=2,
            color_lookup=sv.ColorLookup.TRACK
        )
        try:
            label_annot = sv.RichLabelAnnotator(
                color=color_palette,
                font_size=16,
                border_radius=3,
                text_padding=5,
                color_lookup=sv.ColorLookup.TRACK
            )
        except:
            label_annot = sv.LabelAnnotator()

        speedometer = Speedometer(mapper, FPS, unit=MPS_TO_KPH)

        poly = np.array(image_pts, dtype=np.int32)
        poly_pts = poly.reshape((-1, 1, 2))

        zone = sv.PolygonZone(poly, (sv.Position.TOP_CENTER, sv.Position.BOTTOM_CENTER))

        overlay_color_bgr = (0, 180, 0)
        overlay_alpha = 0.22
        border_color_bgr = (0, 255, 0)
        border_thickness = 2

        w, h = video_info.resolution_wh
        imgsz_w = int(math.ceil(w / imgsz_multiple_of) * imgsz_multiple_of)
        imgsz_h = int(math.ceil(h / imgsz_multiple_of) * imgsz_multiple_of)

        frames_processed = 0

        with sv.VideoSink(output_video, video_info) as sink:
            for frame in sv.get_video_frames_generator(source_video):
                frames_processed += 1

                orig = frame

                result = model.track(
                    orig,
                    classes=classes,
                    conf=conf,
                    imgsz=(imgsz_h, imgsz_w),
                    persist=True,
                    verbose=False,
                    tracker=tracker_cfg,
                )
                detection_all = sv.Detections.from_ultralytics(result[0])

                try:
                    mask = zone.trigger(detection_all)
                    detection = detection_all[mask]
                except Exception:
                    detection = sv.Detections.from_ultralytics([])

                COCO_NAMES = [
                    "person","bicycle","car","motorcycle","airplane","bus","train","truck"
                ] + [""]*72

                labels = []
                n = len(detection)

                for i in range(n):
                    cid = int(detection.class_id[i]) if detection.class_id is not None else -1
                    cls_name = COCO_NAMES[cid] if 0 <= cid < len(COCO_NAMES) else "vehicle"

                    tid = int(detection.tracker_id[i]) if detection.tracker_id is not None else None

                    if tid is not None:
                        trace = trace_annot.trace.get(tid)
                        speedometer.update_with_trace(tid, trace)
                        sp = speedometer.get_current_speed(tid)
                    else:
                        sp = 0

                    labels.append(f"{cls_name} {sp} km/h")

                annot_frame = orig.copy()
                overlay = annot_frame.copy()
                cv.fillPoly(overlay, [poly_pts], color=overlay_color_bgr)
                annot_frame = cv.addWeighted(overlay, overlay_alpha, annot_frame, 1 - overlay_alpha, 0)
                cv.polylines(annot_frame, [poly_pts], True, border_color_bgr, border_thickness)

                out = annot_frame.copy()
                out = bbox_annot.annotate(out, detection)
                out = trace_annot.annotate(out, detection)
                out = label_annot.annotate(out, detection, labels=labels)

                sink.write_frame(out)

        avg_speeds = {}
        for tid, arr in speedometer.speeds.items():
            if arr:
                avg_speeds[int(tid)] = int(np.mean(arr))

        return {
            "output": output_video,
            "summary": {
                "frames_processed": frames_processed,
                "average_speeds_per_track": avg_speeds
            }
        }

    def process_frame(self, frame_bgr):
        """
        CHIẾN LƯỢC MỚI:
        1. Chạy yolo11m với tracking để có tracker_id và tính tốc độ
        2. Chạy yolov8m để có detection tốt hơn (không tracking)
        3. Map detection từ yolov8m với tracked objects từ yolo11m dựa trên IoU
        4. Hiển thị bboxes từ yolov8m nhưng với tracker_id và speed từ yolo11m
        """
        if not getattr(self, "stream_ready", False):
            raise RuntimeError("Stream mode not initialized.")

        H, W = frame_bgr.shape[:2]
        imgsz_h = (H + 31) // 32 * 32
        imgsz_w = (W + 31) // 32 * 32

        # BƯỚC 1: Chạy yolo11m với tracking để có tracker_id và tính tốc độ
        track_res = self.model.track(
            frame_bgr,
            classes=self.stream_classes,
            conf=self.stream_conf,
            imgsz=(imgsz_h, imgsz_w),
            persist=True,
            tracker=self.stream_tracker,
            verbose=False,
        )
        det_tracked = sv.Detections.from_ultralytics(track_res[0])

        # Filter tracked detections inside zone
        try:
            mask_tracked = self.zone.trigger(det_tracked)
            det_tracked = det_tracked[mask_tracked]
        except Exception:
            det_tracked = sv.Detections.empty()

        # Update trace annotator với tracked detections
        # Trace annotator cần được update để speedometer có thể lấy trace
        dummy_frame = frame_bgr.copy()
        self.trace_annot.annotate(dummy_frame, det_tracked)

        # BƯỚC 2: Chạy yolov8m để có detection tốt hơn
        det_res = self.detector_model.predict(
            frame_bgr,
            imgsz=(imgsz_h, imgsz_w),
            conf=self.stream_conf,
            classes=self.stream_classes,
            verbose=False
        )
        det_display = sv.Detections.from_ultralytics(det_res[0])

        # Filter display detections inside zone
        try:
            mask_display = self.zone.trigger(det_display)
            det_display = det_display[mask_display]
        except Exception:
            det_display = sv.Detections.empty()

        # BƯỚC 3: Map detections từ yolov8m với tracked objects từ yolo11m
        # Tạo dictionary để map tracker_id với speed
        tracker_speeds = {}
        
        # Reset per-frame counts
        frame_vehicle_counts = defaultdict(int)
        frame_speeds = []

        # Update speeds từ tracked detections
        for i in range(len(det_tracked)):
            tid = int(det_tracked.tracker_id[i]) if det_tracked.tracker_id is not None else None
            if tid is not None:
                self.tracked_ids.add(tid)
                trace = self.trace_annot.trace.get(tid)
                self.speedometer.update_with_trace(tid, trace)
                sp = self.speedometer.get_current_speed(tid)
                tracker_speeds[tid] = sp
                self.current_speeds[tid] = sp
                if sp > 0:
                    frame_speeds.append(sp)
                    self.all_speeds.append(sp)

        # BƯỚC 4: Tạo labels cho display detections (chỉ tên phương tiện, không có tốc độ)
        labels = []
        matched_tracker_ids = []
        
        for i in range(len(det_display)):
            cid = int(det_display.class_id[i]) if det_display.class_id is not None else -1
            cls_name = self.class_names[cid] if 0 <= cid < len(self.class_names) else "vehicle"
            
            frame_vehicle_counts[cls_name] += 1
            
            # Tìm tracked detection gần nhất dựa trên IoU để lấy tracker_id
            best_iou = 0
            best_tid = None
            display_box = det_display.xyxy[i]
            
            for j in range(len(det_tracked)):
                if det_tracked.tracker_id is None:
                    continue
                tracked_box = det_tracked.xyxy[j]
                iou = self._calculate_iou(display_box, tracked_box)
                if iou > best_iou and iou > 0.3:  # threshold IoU
                    best_iou = iou
                    best_tid = int(det_tracked.tracker_id[j])
            
            # Chỉ hiển thị tên phương tiện, không có tốc độ
            labels.append(f"{cls_name}")
            
            # Gán tracker_id nếu có match, nếu không thì dùng index
            if best_tid is not None:
                matched_tracker_ids.append(best_tid)
            else:
                matched_tracker_ids.append(i)  # Fallback: dùng index làm pseudo tracker_id
        
        # Gán tracker_id cho det_display để annotators hoạt động đúng
        if len(det_display) > 0:
            det_display.tracker_id = np.array(matched_tracker_ids, dtype=int)

        # Update cumulative vehicle_counts
        for cls_name, count in frame_vehicle_counts.items():
            self.vehicle_counts[cls_name] = max(self.vehicle_counts[cls_name], count)

        # BƯỚC 5: Annotate frame
        annot = frame_bgr.copy()
        overlay = annot.copy()
        cv.fillPoly(overlay, [self.poly_pts], (0, 180, 0))
        annot = cv.addWeighted(overlay, 0.2, annot, 0.8, 0)
        cv.polylines(annot, [self.poly_pts], True, (0, 255, 0), 2)

        # Annotate với display detections (đã có tracker_id)
        if len(det_display) > 0:
            try:
                annot = self.bbox_annot.annotate(annot, det_display)
            except Exception as e:
                print(f"BBox annotation error: {e}")
            
            try:
                annot = self.label_annot.annotate(annot, det_display, labels=labels)
            except Exception as e:
                print(f"Label annotation error: {e}")
                # Fallback: vẽ label thủ công
                for i in range(len(det_display)):
                    x1, y1, x2, y2 = det_display.xyxy[i]
                    cv.putText(annot, labels[i], (int(x1), int(y1) - 10),
                              cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Build metrics
        total_vehicles = len(det_display)  # Đếm từ yolov8m detections
        avg_speed = np.mean(frame_speeds) if frame_speeds else 0

        metrics = {
            "current_count": total_vehicles,
            "current_avg_speed": round(avg_speed, 1),
        }

        return annot, metrics

    def _calculate_iou(self, box1, box2):
        """Calculate IoU between two boxes [x1, y1, x2, y2]"""
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        
        if x2 < x1 or y2 < y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
        area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0

    def get_stream_metrics(self):
        """Get current stream metrics"""
        if not self.stream_ready:
            return {}
        
        avg_speed = np.mean(self.all_speeds) if self.all_speeds else 0
        
        return {
            "total_tracked_vehicles": len(self.tracked_ids),
            "vehicle_counts_by_class": dict(self.vehicle_counts),
            "average_speed_kmh": round(avg_speed, 1),
            "all_speeds": self.all_speeds[-100:]
        }