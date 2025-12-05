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
import supervision as sv

def init_annotators(stream_fps: int):
    try:
        colors = ("#007fff", "#0072e6", "#0066cc", "#0059b3", "#004c99", "#004080")
        color_palette = sv.ColorPalette([sv.Color.from_hex(c) for c in colors])

        bbox_annot = sv.BoxAnnotator(
            color=color_palette,
            thickness=2,
            color_lookup=sv.ColorLookup.TRACK
        )
        trace_annot = sv.TraceAnnotator(
            color=color_palette,
            trace_length=stream_fps,
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
        except Exception:
            label_annot = sv.LabelAnnotator()

        return bbox_annot, trace_annot, label_annot
    except Exception as e:
        print(f"Error initializing annotators: {e}")
        raise
