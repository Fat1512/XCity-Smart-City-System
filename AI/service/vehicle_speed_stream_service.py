import cv2
import numpy as np
from typing import List, Tuple, Dict, Any
import httpx
import asyncio
from datetime import datetime, timezone

from components.manager import ToolManager
from components.logging.logger import setup_logger

logger = setup_logger("vehicle_speed_stream_service")

class VehicleSpeedStreamService:
    def __init__(self, tool_name="vehicle_speed_tool"):
        self.tm = ToolManager()
        try:
            self.tm.auto_register_from_package()
        except:
            pass

        if tool_name not in self.tm.tools:
            raise RuntimeError(f"Tool {tool_name} not registered")

        self.tool_name = tool_name

        tool_class = self.tm.tools[tool_name]
        self.tool = tool_class()

        self.initialized = False

    def init_stream(
        self,
        image_pts: List[Tuple[int, int]],
        world_pts: List[Tuple[float, float]],
        classes=None,
        conf=None,
        tracker_cfg=None,
        yolo_weights=None,
        fps=30,
    ):
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
        """
        Process a single frame and return annotated frame + metrics
        
        Returns:
            Tuple of (annotated_frame, metrics_dict)
        """
        if not self.initialized:
            raise RuntimeError("Stream not initialized. Call init_stream first.")
        
        # Process frame with tool (now returns frame and metrics)
        result = self.tool.process_frame(frame_bgr)
        
        # Handle both old and new return formats
        if isinstance(result, tuple):
            annotated_frame, metrics = result
        else:
            # Old format - just frame
            annotated_frame = result
            metrics = {}
        
        return annotated_frame, metrics
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current streaming metrics"""
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
        headers: dict | None = None,
        timeout: float = 5.0,
    ) -> tuple[bool, str]:
        """
        Upsert an entity to Orion-LD using entityOperations/upsert.
        - orion_base: e.g. "http://localhost:1026/ngsi-ld/v1"
        - entity_id: full urn like "urn:ngsi-ld:TrafficFlowObserved:traffic001"
        - entity_type: e.g. "https://smartdatamodels.org/dataModel.Transportation/TrafficFlowObserved"
        - metrics: a dict of values already mapped to attribute names you want in Orion (keys will be used as attribute names)
        - context: JSON-LD context (string url)
        Returns (ok: bool, message: str)
        """
        if not self.initialized:
            return False, "Service not initialized"

        # Build base entity
        entity = {
            "id": entity_id,
            "type": entity_type,
            "@context": context
        }

        # Add metrics as Properties with observedAt where appropriate
        for k, v in metrics.items():
            # If value already contains an 'observedAt' or complex structure, allow as-is
            # But most cases we wrap as a Property with value
            if isinstance(v, dict) and ("type" in v and "value" in v):
                # assume already well-formed NGSI-LD attr
                entity[k] = v
            else:
                # default form
                entity[k] = {"type": "Property", "value": v}

        payload = [entity]

        request_headers = {
            "Content-Type": "application/ld+json"
        }
        if headers:
            request_headers.update(headers)

        upsert_url = orion_base.rstrip("/") + "/entityOperations/upsert"

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                r = await client.post(upsert_url, json=payload, headers=request_headers)
            except Exception as e:
                return False, f"HTTP error on upsert: {e}"

            # Orion-LD returns 201 or 204 usually; check for success-ish codes
            if r.status_code in (200, 201, 204):
                return True, f"Upsert OK ({r.status_code})"
            else:
                return False, f"Upsert failed {r.status_code}: {r.text}"
