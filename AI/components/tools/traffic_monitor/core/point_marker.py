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
import cv2 as cv
import numpy as np
from numpy.typing import NDArray
from typing import Any
import supervision as sv
from matplotlib.pyplot import imshow

SOURCE_VIDEO = "video.mp4"


class PointMarker:
    def __init__(self, window: str = "Image") -> None:
        self._window = window
        self._points: list[tuple[int, int]] = list()

    def __call__(self, image: NDArray, inplace: bool = False) -> list[tuple[int, int]]:
        return self.mark(image, inplace)

    @property
    def points(self) -> list[tuple[int, int]]:
        return self._points

    def mark(self, image: NDArray, inplace: bool = False) -> list[tuple[int, int]]:
        if not inplace:
            image = image.copy()
        cv.namedWindow(self._window, cv.WINDOW_NORMAL)
        cv.setMouseCallback(self._window, self._record_point, param=image)

        while True:
            cv.imshow(self._window, image)
            if cv.waitKey(1) == ord("q"):
                break

        cv.destroyAllWindows()
        return self._points

    def _record_point(self, event: int, x: int, y: int, flags: int, image: Any | None) -> None:
        if event == cv.EVENT_LBUTTONDOWN:
            self._points.append((x, y))
            if image is not None:
                self._draw_point(image, (x, y))

    def _draw_point(self, image: NDArray, point: tuple[int, int]) -> None:
        cv.drawMarker(image, point, (0, 123, 255), cv.MARKER_CROSS, 20, 4, cv.LINE_AA)



if __name__ == "__main__":
    cap = cv.VideoCapture(SOURCE_VIDEO)
    ret, img = cap.read()
    cap.release()

    img = cv.cvtColor(cv.cvtColor(img, cv.COLOR_BGR2GRAY), cv.COLOR_GRAY2BGR)

    color1 = sv.Color.from_hex("#004080")
    color2 = sv.Color.from_hex("#f78923")
    poly = np.array(((800, 410), (1125, 410), (1920, 850), (0, 850)))

    img = sv.draw_filled_polygon(img, poly, color1, 0.5)
    img = sv.draw_polygon(img, poly, sv.Color.WHITE, 12)
    img = sv.draw_text(img, "A", sv.Point(800, 370), color2, 2, 6)
    img = sv.draw_text(img, "B", sv.Point(1125, 370), color2, 2, 6)
    img = sv.draw_text(img, "C", sv.Point(1880, 780), color2, 2, 6)
    img = sv.draw_text(img, "D", sv.Point(40, 780), color2, 2, 6)

    marker = PointMarker("Pick Points")
    points = marker(img)

    print("=== Selected points ===")
    print(points)

    imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
