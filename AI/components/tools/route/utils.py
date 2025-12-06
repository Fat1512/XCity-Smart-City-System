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
import logging
from typing import Tuple, List, Dict
from shapely.geometry import LineString, mapping
from components.logging.logger import setup_logger

logger = setup_logger("route_tool")

DEFAULT_SPEED_KMH = 50.0
REQUEST_TIMEOUT = 300

def _route_nodes_to_coords_and_eta(G_local, route_nodes: List[int], default_speed_kmh: float = DEFAULT_SPEED_KMH) -> Tuple[List[Tuple[float, float]], float]:
    coords: List[Tuple[float, float]] = []
    eta_s = 0.0
    segment_ids = []

    for i in range(len(route_nodes) - 1):
        u = route_nodes[i]
        v = route_nodes[i + 1]
        data_dict = G_local.get_edge_data(u, v)
        if not data_dict:
            continue
            
        # Lấy cạnh có travel_time (nếu có nhiều cạnh giữa 2 node)
        chosen_attr = None
        for k, attr in data_dict.items():
            if "travel_time" in attr:
                chosen_attr = attr
                break
        if chosen_attr is None:
            chosen_attr = list(data_dict.values())[0]
        # print("DEBUGGG",chosen_attr)
        raw_osmid = chosen_attr.get("osmid") or chosen_attr.get("id")
        if raw_osmid:
            segment_ids.append(raw_osmid)

        if "travel_time" in chosen_attr:
            tt = float(chosen_attr["travel_time"])
        else:
            length_m = chosen_attr.get("length", 100.0)
            tt = length_m / (default_speed_kmh * 1000.0 / 3600.0)
        eta_s += tt

        geom = chosen_attr.get("geometry")
        if geom is not None:
            try:
                line = geom if isinstance(geom, LineString) else LineString(geom)
                pts = list(mapping(line)["coordinates"])  # (lon, lat)
                pts_latlon = [(p[1], p[0]) for p in pts]
            except Exception:
                pts_latlon = []
        else:
            pts_latlon = []

        if not pts_latlon:
            udata = G_local.nodes[u]
            vdata = G_local.nodes[v]
            pts_latlon = [(udata.get("y"), udata.get("x")), (vdata.get("y"), vdata.get("x"))]

        if not coords:
            coords.extend(pts_latlon)
        else:
            if coords[-1] == pts_latlon[0]:
                coords.extend(pts_latlon[1:])
            else:
                coords.extend(pts_latlon)

    return coords, eta_s, segment_ids