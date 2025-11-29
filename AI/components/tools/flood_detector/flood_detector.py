from __future__ import annotations
from typing import Any, Optional, Dict, Tuple
import os
import io
import requests
import time
from PIL import Image
import numpy as np
import cv2

from transformers import pipeline, Pipeline
from components.interfaces import Tool


class FloodDetector(Tool):
    name = "flood_detector"
    description = "Detect flood from an image using prithivMLmods/Flood-Image-Detection"
    category = "vision"
    enabled = True

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or "prithivMLmods/Flood-Image-Detection"
        self.pipe: Optional[Pipeline] = None
        self._loaded = False

        self._metrics = {}
        self._frames_processed = 0
        self._last_ts = None

    def _ensure_loaded(self):
        if self._loaded:
            return
        self.pipe = pipeline("image-classification", model=self.model_name)
        self._loaded = True

    def _load_image_from_input(self, image: Any) -> Image.Image:
        if isinstance(image, Image.Image):
            return image.convert("RGB")
        if isinstance(image, (bytes, bytearray)):
            return Image.open(io.BytesIO(image)).convert("RGB")
        if isinstance(image, str):
            if os.path.exists(image):
                return Image.open(image).convert("RGB")
            if image.startswith("http://") or image.startswith("https://"):
                resp = requests.get(image, timeout=10)
                resp.raise_for_status()
                return Image.open(io.BytesIO(resp.content)).convert("RGB")
            raise ValueError(f"Invalid path or url: {image}")
        raise ValueError(f"Unsupported input type: {type(image)}")

    def call(self, image: Any, top_k: int = 1) -> Dict[str, Any]:
        try:
            pil = self._load_image_from_input(image)
        except Exception as e:
            return {"predictions": [], "is_flood": False, "error": str(e)}

        rgb = np.array(pil)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

        _, metrics = self.process_frame(bgr)

        score = float(metrics.get("score", {}).get("value", 0.0))
        is_flood = bool(metrics.get("is_flood", {}).get("value", False))

        predictions = [{"label": "flood" if is_flood else "no_flood", "score": score}]

        return {"predictions": predictions, "is_flood": is_flood, "metrics": metrics}

    def init_stream_mode(self, **kwargs) -> bool:
        if kwargs.get("preload", False):
            self._ensure_loaded()
        self._metrics = {}
        self._frames_processed = 0
        self._last_ts = None
        return True

    def get_stream_metrics(self) -> Dict[str, Any]:
        return {
            "frames_processed": {"type": "Property", "value": self._frames_processed},
            "last_ts": {"type": "Property", "value": int(self._last_ts or 0)}
        }

    def process_frame(self, frame_bgr: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        try:
            rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        except Exception:
            rgb = frame_bgr

        is_flood = False
        score = 0.0

        try:
            self._ensure_loaded()
            pil = Image.fromarray(rgb)
            
            preds = self.pipe(pil, top_k=3)
            best = preds[0] if preds else {"label": "", "score": 0.0}
            label = best.get("label", "").lower()
            
            score = float(best.get("score", 0.0))
            is_flood = "flood" in label or "flooded" in label
            
        except Exception:
            is_flood = False
            score = 0.0

        annotated = frame_bgr.copy()
        text = f"Flood: {is_flood} ({score:.2f})"
        cv2.rectangle(annotated, (0, 0), (350, 30), (0, 0, 0), -1)
        cv2.putText(annotated, text, (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        self._frames_processed += 1
        self._last_ts = int(time.time() * 1000)

        metrics = {
            "is_flood": {"type": "Property", "value": bool(is_flood)},
            "score": {"type": "Property", "value": float(score)},
            "frames_processed": {"type": "Property", "value": self._frames_processed}
        }

        return annotated, metrics