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
from typing import List, Tuple, Dict, Any, Optional
from pathlib import Path

import numpy as np
import httpx

from components.manager import ToolManager
from components.logging.logger import setup_logger

logger = setup_logger("vehicle_speed_stream_service")


class VehicleSpeedStreamService:
    def __init__(self, tool_name: str = "vehicle_speed_tool"):
        self.tm = ToolManager()
        try:
            self.tm.auto_register_from_package()
        except Exception as e:
            logger.warning("ToolManager.auto_register_from_package failed: %s", e)

        if tool_name not in self.tm.tools:
            raise RuntimeError(f"Tool {tool_name} not registered")

        self.tool_name = tool_name
        tool_class = self.tm.tools[tool_name]
        self.tool = tool_class()

        self.initialized = False
        self.stream_config: Dict[str, Any] = {}

    def init_stream(
        self,
        image_pts: List[Tuple[int, int]],
        world_pts: List[Tuple[float, float]],
        classes: Optional[List[int]] = None,
        conf: Optional[float] = None,
        tracker_cfg: Optional[str] = None,
        yolo_weights: Optional[str] = None,
        fps: int = 30,
    ) -> bool:
        self.stream_config = {
            "image_pts": image_pts,
            "world_pts": world_pts,
            "classes": classes,
            "conf": conf,
            "tracker_cfg": tracker_cfg,
            "yolo_weights": yolo_weights,
            "fps_override": fps,
        }

        success = self.tool.init_stream_mode(**self.stream_config)
        if not success:
            raise RuntimeError("Failed to initialize stream mode in tool")

        self.initialized = True
        logger.info("Stream initialized successfully")
        return True

    def process_frame(self, frame_bgr: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        if not self.initialized:
            raise RuntimeError("Stream not initialized. Call init_stream first.")

        result = self.tool.process_frame(frame_bgr)

        if isinstance(result, tuple) and len(result) == 2:
            annotated_frame, metrics = result
        else:
            annotated_frame = result
            metrics = {}

        return annotated_frame, metrics

    def get_metrics(self) -> Dict[str, Any]:
        if not self.initialized:
            return {}
        return self.tool.get_stream_metrics()

    async def publish_metrics_upsert(
        self,
        orion_base: str,
        entity_id: str,
        entity_type: str,
        metrics: Dict[str, Any],
        context: str = "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
        headers: Optional[Dict[str, str]] = None,
        timeout: float = 5.0,
    ) -> Tuple[bool, str]:
        """
        Upsert an entity to Orion-LD using /entityOperations/upsert.
        Returns (ok: bool, message: str).
        """
        if not self.initialized:
            return False, "Service not initialized"

        entity: Dict[str, Any] = {"id": entity_id, "type": entity_type, "@context": context}

        for k, v in metrics.items():
            if isinstance(v, dict) and ("type" in v and "value" in v):
                entity[k] = v
            else:
                entity[k] = {"type": "Property", "value": v}

        payload = [entity]
        request_headers = {"Content-Type": "application/ld+json"}
        if headers:
            request_headers.update(headers)

        upsert_url = orion_base.rstrip("/") + "/entityOperations/upsert"

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                r = await client.post(upsert_url, json=payload, headers=request_headers)
            except Exception as e:
                logger.exception("HTTP error on upsert: %s", e)
                return False, f"HTTP error on upsert: {e}"

        if r.status_code in (200, 201, 204):
            return True, f"Upsert OK ({r.status_code})"
        else:
            logger.warning("Upsert failed %s: %s", r.status_code, r.text)
            return False, f"Upsert failed {r.status_code}: {r.text}"
