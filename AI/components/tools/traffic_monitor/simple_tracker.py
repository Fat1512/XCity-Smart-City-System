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
from typing import List, Tuple
import numpy as np

class SimpleTracker:
    def __init__(self, iou_threshold: float = 0.3, max_lost: int = 5):
        self.next_id = 0
        self.tracks = {}    # id -> box (x1,y1,x2,y2)
        self.lost = {}      # id -> lost frames
        self.iou_thr = iou_threshold
        self.max_lost = max_lost

    def _iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0]); yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2]); yB = min(boxA[3], boxB[3])
        if xB <= xA or yB <= yA:
            return 0.0
        inter = (xB - xA) * (yB - yA)
        boxAArea = max(0.0, (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]))
        boxBArea = max(0.0, (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]))
        den = (boxAArea + boxBArea - inter)
        return inter / den if den > 0 else 0.0

    def update(self, boxes: np.ndarray) -> np.ndarray:
        assigned = {}
        used_track_ids = set()
        boxes_list = [tuple(b) for b in boxes]

        for tid, tbox in list(self.tracks.items()):
            best_iou = 0.0; best_j = None
            for j, bbox in enumerate(boxes_list):
                if j in assigned:
                    continue
                iou = self._iou(tbox, bbox)
                if iou > best_iou:
                    best_iou = iou; best_j = j
            if best_j is not None and best_iou >= self.iou_thr:
                assigned[best_j] = tid
                self.tracks[tid] = boxes_list[best_j]
                self.lost[tid] = 0
                used_track_ids.add(tid)

        for j, bbox in enumerate(boxes_list):
            if j not in assigned:
                tid = self.next_id
                self.next_id += 1
                self.tracks[tid] = bbox
                self.lost[tid] = 0
                assigned[j] = tid

        for tid in list(self.tracks.keys()):
            if tid not in used_track_ids and tid not in assigned.values():
                self.lost[tid] = self.lost.get(tid, 0) + 1
                if self.lost[tid] > self.max_lost:
                    del self.tracks[tid]
                    del self.lost[tid]

        ids = [assigned[j] for j in range(len(boxes_list))]
        return np.array(ids, dtype=int)
