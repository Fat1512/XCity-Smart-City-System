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
import traceback

from components.interfaces import Tool

from .core.cam_mapper import Cam2WorldMapper
from .core.speedometer import Speedometer, MPS_TO_KPH

from .simple_tracker import SimpleTracker
from .onnx_utils import load_onnx, run_onnx
from .annotators import init_annotators
import supervision as sv
import math

class VehicleSpeedTool(Tool):
    name: str = "vehicle_speed_tool"
    description: str = "Detect vehicles, estimate speed, filter inside zone & draw polygon overlay."
    category: str = "traffic"
    enabled: bool = True

    def __init__(self, yolo_weights: str = "models/yolo_nas_s_fp16.onnx", detector_weights: str = "models/yolo_nas_s_fp16.onnx"):
        self.enable_draw = False
        self.yolo_weights = yolo_weights
        self.stream_ready = False
        self.model = None
        self.detector_model = None
        self.detector_weights = detector_weights
        self.mapper = None
        self.speedometer = None
        self.zone = None
        self.poly_pts = None

        self.simple_tracker = SimpleTracker(iou_threshold=0.3, max_lost=5)

        self.vehicle_counts = defaultdict(int)
        self.current_speeds = {}
        self.all_speeds = []
        self.tracked_ids = set()
        self.stream_fps = 30
        self.stream_conf = 0.4
        self.stream_classes = [2,3,5,6]
        self.class_names = [
            "person","bicycle","car","motorcycle","airplane","bus","train","truck"
        ] + [""]*72

        # annotators placeholders
        self.bbox_annot = None
        self.trace_annot = None
        self.label_annot = None

    def call(self):
        pass

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
            weights_detector = detector_weights or self.detector_weights

            self.model = load_onnx(weights_speed)
            self.detector_model = load_onnx(weights_detector)

            self.stream_classes = classes or self.stream_classes
            self.stream_conf = conf or self.stream_conf
            self.stream_tracker = tracker_cfg or "simple"
            self.stream_fps = fps_override or self.stream_fps

            self.mapper = Cam2WorldMapper()
            self.mapper.find_perspective_transform(image_pts, world_pts)
            self.speedometer = Speedometer(self.mapper, self.stream_fps, unit=MPS_TO_KPH)

            self.bbox_annot, self.trace_annot, self.label_annot = init_annotators(self.stream_fps)

            poly = np.array(image_pts, dtype=np.int32)
            self.poly_pts = poly.reshape((-1, 1, 2))
            self.zone = sv.PolygonZone(poly, (sv.Position.TOP_CENTER, sv.Position.BOTTOM_CENTER))

            self.vehicle_counts = defaultdict(int)
            self.current_speeds = {}
            self.all_speeds = []
            self.tracked_ids = set()
            self.simple_tracker = SimpleTracker(iou_threshold=0.3, max_lost=5)

            self.stream_ready = True
            return True
        except Exception as e:
            print(f"Error initializing stream mode: {e}")
            traceback.print_exc()
            self.stream_ready = False
            return False

    def validate_input(self, *args, **kwargs) -> Optional[str]:
        if "source_video" not in kwargs:
            return "Missing source_video"
        if "image_pts" not in kwargs or "world_pts" not in kwargs:
            return "Missing image_pts or world_pts"
        return None

    def process_frame(self, frame_bgr):
        if not getattr(self, "stream_ready", False):
            raise RuntimeError("Stream mode not initialized.")

        try:
            # H, W = frame_bgr.shape[:2]
            imgsz = (640, 640)

            boxes_t, scores_t, classes_t = run_onnx(self.model, frame_bgr, imgsz=imgsz, conf_thres=self.stream_conf)
            if len(boxes_t) == 0:
                det_tracked = sv.Detections.empty()
            else:
                ids = self.simple_tracker.update(boxes_t)
                det_tracked = sv.Detections(xyxy=boxes_t, confidence=scores_t, class_id=classes_t)
                det_tracked.tracker_id = ids

            try:
                mask_tracked = self.zone.trigger(det_tracked)
                det_tracked = det_tracked[mask_tracked]
            except Exception:
                det_tracked = sv.Detections.empty()

            dummy_frame = frame_bgr.copy()
            try:
                self.trace_annot.annotate(dummy_frame, det_tracked)
            except Exception:
                pass

            boxes_d, scores_d, classes_d = run_onnx(self.detector_model, frame_bgr, imgsz=imgsz, conf_thres=self.stream_conf)
            if len(boxes_d) == 0:
                det_display = sv.Detections.empty()
            else:
                det_display = sv.Detections(xyxy=boxes_d, confidence=scores_d, class_id=classes_d)

            try:
                mask_display = self.zone.trigger(det_display)
                det_display = det_display[mask_display]
            except Exception:
                det_display = sv.Detections.empty()

            tracker_speeds = {}
            frame_vehicle_counts = defaultdict(int)
            frame_speeds = []

            for i in range(len(det_tracked)):
                tid = int(det_tracked.tracker_id[i]) if getattr(det_tracked, "tracker_id", None) is not None else None
                if tid is not None:
                    self.tracked_ids.add(tid)
                    trace = self.trace_annot.trace.get(tid)
                    try:
                        self.speedometer.update_with_trace(tid, trace)
                        sp = self.speedometer.get_current_speed(tid)
                    except Exception:
                        sp = 0
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

                best_iou = 0.0
                best_tid = None
                display_box = det_display.xyxy[i]

                for j in range(len(det_tracked)):
                    if getattr(det_tracked, "tracker_id", None) is None:
                        continue
                    tracked_box = det_tracked.xyxy[j]
                    iou = self._calculate_iou(display_box, tracked_box)
                    if iou > best_iou and iou > 0.3:
                        best_iou = iou
                        best_tid = int(det_tracked.tracker_id[j])

                labels.append(f"{cls_name}")

                if best_tid is not None:
                    matched_tracker_ids.append(best_tid)
                else:
                    matched_tracker_ids.append(i)

            if len(det_display) > 0:
                det_display.tracker_id = np.array(matched_tracker_ids, dtype=int)

            for cls_name, count in frame_vehicle_counts.items():
                self.vehicle_counts[cls_name] = max(self.vehicle_counts[cls_name], count)

            if not self.enable_draw:
                total_vehicles = len(det_display)
                avg_speed = np.mean(frame_speeds) if frame_speeds else 0

                metrics = {
                    "current_count": total_vehicles,
                    "current_avg_speed": round(avg_speed, 1),
                }

                return frame_bgr, metrics

            annot = frame_bgr.copy()
            overlay = annot.copy()
            cv.fillPoly(overlay, [self.poly_pts], (0, 180, 0))
            annot = cv.addWeighted(overlay, 0.2, annot, 0.8, 0)
            cv.polylines(annot, [self.poly_pts], True, (0,255,0), 2)

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
                        cv.putText(annot, labels[i], (int(x1), int(y1)-10),
                                  cv.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

            total_vehicles = len(det_display)
            avg_speed = np.mean(frame_speeds) if frame_speeds else 0

            metrics = {
                "current_count": total_vehicles,
                "current_avg_speed": round(avg_speed, 1),
            }

            return annot, metrics

        except Exception as e:
            print(f"Error processing frame: {e}")
            traceback.print_exc()
            return frame_bgr, {}

    def _calculate_iou(self, box1, box2):
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        if x2 < x1 or y2 < y1:
            return 0.0
        intersection = (x2 - x1) * (y2 - y1)
        area1 = max(0.0, (box1[2] - box1[0]) * (box1[3] - box1[1]))
        area2 = max(0.0, (box2[2] - box2[0]) * (box2[3] - box2[1]))
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