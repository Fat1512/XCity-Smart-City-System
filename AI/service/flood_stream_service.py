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
from typing import Tuple, Dict, Any, Optional
import numpy as np
from components.manager import ToolManager


class FloodStreamService:
    def __init__(self) -> None:
        self.tool_manager = ToolManager()
        self.flood_detector = None
        self.initialized = False

    def init_stream(self, fps: int = 1, **kwargs) -> None:
        self.flood_detector = self.tool_manager.get("flood_detector")

        if self.flood_detector is None:
            raise RuntimeError("FloodDetector tool not registered")

        self.flood_detector.init_stream_mode(preload=True)
        self.initialized = True
        print(f"FloodStreamService initialized with FPS={fps}")

    def process_frame(self, frame_bgr: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
        if not self.initialized or self.flood_detector is None:
            raise RuntimeError("Service not initialized. Call init_stream() first")

        annotated_frame, metrics = self.flood_detector.process_frame(frame_bgr)
        return annotated_frame, metrics

    def get_metrics(self) -> Dict[str, Any]:
        if self.flood_detector:
            return self.flood_detector.get_stream_metrics()
        return {}
