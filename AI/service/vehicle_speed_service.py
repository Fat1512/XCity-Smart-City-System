from typing import Optional, Tuple, List, Dict, Any
import os
import uuid
from pathlib import Path
from datetime import datetime

from components.manager import ToolManager
from components.logging.logger import setup_logger

logger = setup_logger("vehicle_speed_service")

class VehicleSpeedService:
    def __init__(self, tool_name: str = "vehicle_speed_tool"):
        self.tool_name = tool_name
        self.tm = ToolManager()
        try:
            self.tm.auto_register_from_package()
        except Exception:
            pass

    def _validate_points(self, pts: List[Tuple[float, float]]) -> bool:
        if not isinstance(pts, (list, tuple)) or len(pts) < 4:
            return False
        for p in pts:
            if not (isinstance(p, (list, tuple)) and len(p) == 2):
                return False
            try:
                float(p[0]); float(p[1])
            except Exception:
                return False
        return True

    def process_video(
        self,
        source_video: Optional[str] = None,
        video_bytes: Optional[bytes] = None,
        output_video: Optional[str] = None,
        image_pts: Optional[List[Tuple[int, int]]] = None,
        world_pts: Optional[List[Tuple[float, float]]] = None,
        classes: Optional[List[int]] = None,
        conf: Optional[float] = None,
        tracker_cfg: Optional[str] = None,
        fps_override: Optional[int] = None,
        yolo_weights: Optional[str] = None,
        run_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:

        run_id = str(uuid.uuid4())
        logger.info(f"[START] Speed service run: {run_id} at {datetime.utcnow().isoformat()}Z")

        temp_video_path = None

        try:
            if video_bytes is not None:
                tmp_fn = Path("/tmp") / f"speed_input_{run_id}.mp4"
                with open(tmp_fn, "wb") as f:
                    f.write(video_bytes)
                source_video = str(tmp_fn)
                temp_video_path = source_video

            if not source_video:
                raise ValueError("source_video path or video_bytes must be provided")

            if not Path(source_video).exists():
                raise FileNotFoundError(f"Source video not found: {source_video}")

            logger.info(f"[INFO] Using video: {source_video}")

            # --- validate calibration points ---
            if not self._validate_points(image_pts or []):
                raise ValueError("image_pts must be a list of at least 4 (x,y) pairs")

            if not self._validate_points(world_pts or []):
                raise ValueError("world_pts must be a list of at least 4 (x,y) pairs")

            # --- output video path ---
            if not output_video:
                p = Path(source_video)
                output_video = str(p.with_name(p.stem + "-speed-annotated" + p.suffix))

            logger.info(f"[INFO] Output video will be: {output_video}")

            # --- ensure tool exists ---
            if self.tool_name not in self.tm.tools:
                try:
                    self.tm.auto_register_from_package()
                except Exception:
                    pass
            if self.tool_name not in self.tm.tools:
                raise RuntimeError(f"Tool '{self.tool_name}' is not registered")

            # --- build kwargs ---
            tool_kwargs: Dict[str, Any] = {
                "source_video": source_video,
                "output_video": output_video,
                "image_pts": image_pts,
                "world_pts": world_pts,
            }
            if classes is not None: tool_kwargs["classes"] = classes
            if conf is not None: tool_kwargs["conf"] = conf
            if tracker_cfg is not None: tool_kwargs["tracker_cfg"] = tracker_cfg
            if fps_override is not None: tool_kwargs["fps_override"] = fps_override
            if yolo_weights is not None: tool_kwargs["yolo_weights"] = yolo_weights

            logger.info("[INFO] Executing tool...")

            tool_result = self.tm.execute(self.tool_name, **tool_kwargs)

            logger.info("[DONE] Tool execution completed")

            return {
                "status": "ok",
                "run_id": run_id,
                "output_video": tool_result.get("output") if isinstance(tool_result, dict) else output_video,
                "summary": tool_result.get("summary") if isinstance(tool_result, dict) else tool_result,
            }

        except Exception as e:
            logger.info(f"[ERROR] {e}")
            return {
                "status": "error",
                "run_id": run_id,
                "error": str(e),
            }

        finally:
            if temp_video_path:
                try:
                    os.remove(temp_video_path)
                except Exception:
                    pass
