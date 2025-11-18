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

    def __init__(self, yolo_weights: str = "yolo11m.pt"):
        self.yolo_weights = yolo_weights
        # Initialize stream_ready flag
        self.stream_ready = False
        # Initialize other attributes to None
        self.model = None
        self.mapper = None
        self.speedometer = None
        self.zone = None
        self.poly_pts = None
        
        # Metrics tracking for streaming
        self.vehicle_counts = defaultdict(int)  # count by class_id
        self.current_speeds = {}  # track_id -> current speed
        self.all_speeds = []  # list of all speeds for average calculation
        self.tracked_ids = set()  # set of all tracked IDs seen

    def init_stream_mode(
        self,
        image_pts,
        world_pts,
        classes=None,
        conf=None,
        tracker_cfg=None,
        yolo_weights=None,
        fps_override=30,
    ):
        try:
            # load YOLO
            weights = yolo_weights or self.yolo_weights
            self.model = YOLO(weights, task="detect")

            # save config
            self.stream_classes = classes or [2, 3, 5, 6]
            self.stream_conf = conf or 0.4
            self.stream_tracker = tracker_cfg or "bytetrack.yaml"
            self.stream_fps = fps_override

            # mapper
            self.mapper = Cam2WorldMapper()
            self.mapper.find_perspective_transform(image_pts, world_pts)

            # speed calculator
            self.speedometer = Speedometer(self.mapper, self.stream_fps, unit=MPS_TO_KPH)

            # annotators
            self._init_annotators()

            # polygon zone
            poly = np.array(image_pts, dtype=np.int32)
            self.poly_pts = poly.reshape((-1, 1, 2))
            self.zone = sv.PolygonZone(poly, (sv.Position.TOP_CENTER, sv.Position.BOTTOM_CENTER))

            # Reset metrics
            self.vehicle_counts = defaultdict(int)
            self.current_speeds = {}
            self.all_speeds = []
            self.tracked_ids = set()

            # ready
            self.stream_ready = True
            return True
            
        except Exception as e:
            print(f"Error initializing stream mode: {e}")
            self.stream_ready = False
            return False

    def _init_annotators(self):
        """Initialize annotators for stream mode"""
        try:
            # Color palette
            colors = ("#007fff", "#0072e6", "#0066cc", "#0059b3", "#004c99", "#004080")
            color_palette = sv.ColorPalette([sv.Color.from_hex(c) for c in colors])
            
            # Class names for labels
            self.class_names = [
                "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck"
            ] + [""] * 72

            # Annotators
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

        # camera mapping
        mapper = Cam2WorldMapper()
        mapper.find_perspective_transform(image_pts, world_pts)

        # Load YOLO model
        model = YOLO(yolo_weights, task="detect")

        # Video
        video_info = sv.VideoInfo.from_video_path(source_video)
        FPS = int(fps_override or video_info.fps)

        # --- COLOR PALETTE ---
        colors = ("#007fff", "#0072e6", "#0066cc", "#0059b3", "#004c99", "#004080")
        color_palette = sv.ColorPalette([sv.Color.from_hex(c) for c in colors])

        # --- Annotators ---
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

        # =====================================================================
        # PROCESS VIDEO
        # =====================================================================
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
        if not getattr(self, "stream_ready", False):
            raise RuntimeError("Stream mode not initialized.")

        H, W = frame_bgr.shape[:2]
        imgsz_h = (H + 31) // 32 * 32
        imgsz_w = (W + 31) // 32 * 32

        result = self.model.track(
            frame_bgr,
            classes=self.stream_classes,
            conf=self.stream_conf,
            imgsz=(imgsz_h, imgsz_w),
            persist=True,
            tracker=self.stream_tracker,
            verbose=False,
        )

        det_all = sv.Detections.from_ultralytics(result[0])

        mask = self.zone.trigger(det_all)
        det = det_all[mask]

        # Reset current frame counts
        frame_vehicle_counts = defaultdict(int)
        frame_speeds = []

        # labels
        labels = []
        for i in range(len(det)):
            tid = int(det.tracker_id[i]) if det.tracker_id is not None else None
            
            cid = (
                int(det.class_id[i])
                if det.class_id is not None
                else -1
            )
            cls_name = self.class_names[cid] if 0 <= cid < len(self.class_names) else "vehicle"

            # Count vehicles by class
            frame_vehicle_counts[cls_name] += 1
            
            if tid is not None:
                # Track this ID
                self.tracked_ids.add(tid)
                
                trace = self.trace_annot.trace.get(tid)
                self.speedometer.update_with_trace(tid, trace)
                sp = self.speedometer.get_current_speed(tid)
                
                # Store current speed
                self.current_speeds[tid] = sp
                
                # Add to speeds list if valid
                if sp > 0:
                    frame_speeds.append(sp)
                    self.all_speeds.append(sp)
            else:
                sp = 0

            labels.append(f"{cls_name} {sp} km/h")

        # Update vehicle counts (cumulative)
        for cls_name, count in frame_vehicle_counts.items():
            self.vehicle_counts[cls_name] = max(self.vehicle_counts[cls_name], count)

        # Draw annotations
        annot = frame_bgr.copy()
        overlay = annot.copy()
        cv.fillPoly(overlay, [self.poly_pts], (0, 180, 0))
        annot = cv.addWeighted(overlay, 0.2, annot, 0.8, 0)
        cv.polylines(annot, [self.poly_pts], True, (0, 255, 0), 2)

        annot = self.bbox_annot.annotate(annot, det)
        annot = self.trace_annot.annotate(annot, det)
        annot = self.label_annot.annotate(annot, det, labels=labels)

        # Calculate metrics
        total_vehicles = len(det)
        avg_speed = np.mean(frame_speeds) if frame_speeds else 0
        overall_avg_speed = np.mean(self.all_speeds) if self.all_speeds else 0

        metrics = {
            "current_count": total_vehicles,
            "current_avg_speed": round(avg_speed, 1),
            # "overall_avg_speed": round(overall_avg_speed, 1),
            # "total_tracked": len(self.tracked_ids),
            # "by_class": dict(frame_vehicle_counts)
        }

        return annot, metrics

    def get_stream_metrics(self):
        """Get current stream metrics"""
        if not self.stream_ready:
            return {}
        
        avg_speed = np.mean(self.all_speeds) if self.all_speeds else 0
        
        return {
            "total_tracked_vehicles": len(self.tracked_ids),
            "vehicle_counts_by_class": dict(self.vehicle_counts),
            "average_speed_kmh": round(avg_speed, 1),
            "all_speeds": self.all_speeds[-100:]  # Last 100 speeds
        }