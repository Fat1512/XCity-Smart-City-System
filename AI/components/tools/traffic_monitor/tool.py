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
from __future__ import annotations
from typing import Optional
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
            weights_speed = yolo_weights or self.yolo_weights
            self.model = YOLO(weights_speed, task="detect")

            weights_detector = detector_weights or self.detector_weights
            self.detector_model = YOLO(weights_detector, task="detect")

            self.stream_classes = classes or [2, 3, 5, 6]
            self.stream_conf = conf or 0.4
            self.stream_tracker = tracker_cfg or "bytetrack.yaml"
            self.stream_fps = fps_override

            self.mapper = Cam2WorldMapper()
            self.mapper.find_perspective_transform(image_pts, world_pts)
            self.speedometer = Speedometer(self.mapper, self.stream_fps, unit=MPS_TO_KPH)

            self._init_annotators()

            poly = np.array(image_pts, dtype=np.int32)
            self.poly_pts = poly.reshape((-1, 1, 2))
            self.zone = sv.PolygonZone(poly, (sv.Position.TOP_CENTER, sv.Position.BOTTOM_CENTER))

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
    ):
        pass


    def process_frame(self, frame_bgr):
        if not getattr(self, "stream_ready", False):
            raise RuntimeError("Stream mode not initialized.")

        H, W = frame_bgr.shape[:2]
        imgsz_h = (H + 31) // 32 * 32
        imgsz_w = (W + 31) // 32 * 32

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

        try:
            mask_tracked = self.zone.trigger(det_tracked)
            det_tracked = det_tracked[mask_tracked]
        except Exception:
            det_tracked = sv.Detections.empty()

        dummy_frame = frame_bgr.copy()
        self.trace_annot.annotate(dummy_frame, det_tracked)

        det_res = self.detector_model.predict(
            frame_bgr,
            imgsz=(imgsz_h, imgsz_w),
            conf=self.stream_conf,
            classes=self.stream_classes,
            verbose=False
        )
        det_display = sv.Detections.from_ultralytics(det_res[0])

        try:
            mask_display = self.zone.trigger(det_display)
            det_display = det_display[mask_display]
        except Exception:
            det_display = sv.Detections.empty()

        tracker_speeds = {}
        
        frame_vehicle_counts = defaultdict(int)
        frame_speeds = []

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

        labels = []
        matched_tracker_ids = []
        
        for i in range(len(det_display)):
            cid = int(det_display.class_id[i]) if det_display.class_id is not None else -1
            cls_name = self.class_names[cid] if 0 <= cid < len(self.class_names) else "vehicle"
            
            frame_vehicle_counts[cls_name] += 1
            
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
            
            labels.append(f"{cls_name}")
            
            if best_tid is not None:
                matched_tracker_ids.append(best_tid)
            else:
                matched_tracker_ids.append(i)  # Fallback: dùng index làm pseudo tracker_id
        
        if len(det_display) > 0:
            det_display.tracker_id = np.array(matched_tracker_ids, dtype=int)

        for cls_name, count in frame_vehicle_counts.items():
            self.vehicle_counts[cls_name] = max(self.vehicle_counts[cls_name], count)

        annot = frame_bgr.copy()
        overlay = annot.copy()
        cv.fillPoly(overlay, [self.poly_pts], (0, 180, 0))
        annot = cv.addWeighted(overlay, 0.2, annot, 0.8, 0)
        cv.polylines(annot, [self.poly_pts], True, (0, 255, 0), 2)

        if len(det_display) > 0:
            try:
                annot = self.bbox_annot.annotate(annot, det_display)
            except Exception as e:
                print(f"BBox annotation error: {e}")
            
            try:
                annot = self.label_annot.annotate(annot, det_display, labels=labels)
            except Exception as e:
                print(f"Label annotation error: {e}")
                for i in range(len(det_display)):
                    x1, y1, x2, y2 = det_display.xyxy[i]
                    cv.putText(annot, labels[i], (int(x1), int(y1) - 10),
                              cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        total_vehicles = len(det_display)
        avg_speed = np.mean(frame_speeds) if frame_speeds else 0

        metrics = {
            "current_count": total_vehicles,
            "current_avg_speed": round(avg_speed, 1),
        }

        return annot, metrics

    def _calculate_iou(self, box1, box2):
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
        if not self.stream_ready:
            return {}
        
        avg_speed = np.mean(self.all_speeds) if self.all_speeds else 0
        
        return {
            "total_tracked_vehicles": len(self.tracked_ids),
            "vehicle_counts_by_class": dict(self.vehicle_counts),
            "average_speed_kmh": round(avg_speed, 1),
            "all_speeds": self.all_speeds[-100:]
        }