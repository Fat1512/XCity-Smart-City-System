import numpy as np
from collections import defaultdict
from numpy.typing import NDArray
from .cam_mapper import Cam2WorldMapper
from ..config import MPS_TO_KPH

class Speedometer:
    def __init__(self, mapper: Cam2WorldMapper, fps: int, unit: float = MPS_TO_KPH) -> None:
        self._mapper = mapper
        self._fps = fps
        self._unit = unit
        self._speeds: defaultdict[int, list[int]] = defaultdict(list)

    @property
    def speeds(self):
        return self._speeds

    def update_with_trace(self, idx: int, image_trace: NDArray | None) -> None:
        if image_trace is None or len(image_trace) <= 1:
            return
        world_trace = self._mapper(image_trace)
        dx, dy = np.median(np.abs(np.diff(world_trace, axis=0)), axis=0)
        ds = np.linalg.norm((dx, dy))
        self._speeds[idx].append(int(ds * self._fps * self._unit))

    def get_current_speed(self, idx: int) -> int:
        return self._speeds[idx][-1] if self._speeds[idx] else 0
