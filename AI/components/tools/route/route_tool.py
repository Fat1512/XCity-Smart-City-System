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
import time
import logging
import networkx as nx

from components.interfaces import Tool
from components.logging.logger import setup_logger
from .graph import _load_graph_cache, _find_reachable_node, _compute_edge_travel_times, _nearest_node_fallback, project_lonlat_to_xy
from .utils import _route_nodes_to_coords_and_eta, DEFAULT_SPEED_KMH, REQUEST_TIMEOUT

logger = setup_logger("route_tool")

class RouteTool(Tool):
    name = "route_tool"
    description = "Compute shortest driving route between two coordinates (lat, lon). Returns GeoJSON FeatureCollection."
    category = "geo"
    enabled = True

    GRAPH_CENTER = (10.7927, 106.6537)
    GRAPH_DIST = 3000
    GRAPH_CACHE = "cache/hcm.graphml"
    DEFAULT_SPEED_KMH = DEFAULT_SPEED_KMH
    REQUEST_TIMEOUT = REQUEST_TIMEOUT

    def validate_input(self, start: Tuple[float, float], end: Tuple[float, float]) -> Optional[str]:
        try:
            if not (isinstance(start, (list, tuple)) and isinstance(end, (list, tuple))):
                return "start và end phải là list/tuple [lat, lon]"
            if len(start) != 2 or len(end) != 2:
                return "start và end phải gồm 2 phần tử: [lat, lon]"
            for v in (*start, *end):
                if not isinstance(v, (int, float)):
                    return "tọa độ phải là số"
                if v < -180 or v > 180:
                    return "tọa độ nằm ngoài khoảng hợp lệ"
        except Exception:
            return "Invalid input format"
        return None

    def _prepare_graph(self):
        return _load_graph_cache(center_point=self.GRAPH_CENTER, dist=self.GRAPH_DIST, cache_path=self.GRAPH_CACHE)

    def call(self, start: Tuple[float, float], end: Tuple[float, float]) -> Dict[str, Any]:
        t0 = time.time()
        logger.info("Computing route from %s to %s", start, end)

        G_local, Gp_local = self._prepare_graph()

        try:
            sx, sy = project_lonlat_to_xy(Gp_local, float(start[1]), float(start[0]))
            ex, ey = project_lonlat_to_xy(Gp_local, float(end[1]), float(end[0]))

            start_node = _find_reachable_node(G_local, Gp_local, sx, sy, other_node=None, mode="either", k=30)
            end_node = _find_reachable_node(G_local, Gp_local, ex, ey, other_node=start_node, mode="target", k=40)

            if start_node is None:
                start_node = _nearest_node_fallback(Gp_local, sx, sy)
            if end_node is None:
                end_node = _nearest_node_fallback(Gp_local, ex, ey)
        except Exception as exc:
            logger.error("Error locating nodes: %s", exc)
            return {"error": "Could not locate start/end points on map"}

        try:
            edge_tt_no = _compute_edge_travel_times(
                G_local,
                default_speed_kmh=self.DEFAULT_SPEED_KMH,
                use_traffic=False,
            )
            for (u, v, k), tt in edge_tt_no.items():
                if (u, v, k) in G_local.edges(keys=True):
                    G_local[u][v][k]["travel_time"] = tt
                else:
                    data = G_local.get_edge_data(u, v)
                    if data:
                        first_k = list(data.keys())[0]
                        G_local[u][v][first_k]["travel_time"] = tt

            no_traffic_nodes = nx.shortest_path(G_local, start_node, end_node, weight="travel_time")

            no_traffic_coords, no_traffic_eta_s = _route_nodes_to_coords_and_eta(
                G_local,
                no_traffic_nodes,
                default_speed_kmh=self.DEFAULT_SPEED_KMH,
            )
        except nx.NetworkXNoPath:
            no_traffic_nodes = None
            no_traffic_coords = None
            no_traffic_eta_s = None
        except Exception as exc:
            logger.warning("Failed no-traffic route: %s", exc)
            no_traffic_nodes = None
            no_traffic_coords = None
            no_traffic_eta_s = None

        try:
            edge_tt_cur = _compute_edge_travel_times(
                G_local,
                default_speed_kmh=self.DEFAULT_SPEED_KMH,
                use_traffic=True,
            )
            for (u, v, k), tt in edge_tt_cur.items():
                if (u, v, k) in G_local.edges(keys=True):
                    G_local[u][v][k]["travel_time"] = tt
                else:
                    data = G_local.get_edge_data(u, v)
                    if data:
                        first_k = list(data.keys())[0]
                        G_local[u][v][first_k]["travel_time"] = tt

            current_nodes = nx.shortest_path(G_local, start_node, end_node, weight="travel_time")
        except nx.NetworkXNoPath:
            return {"error": "No path found between points"}
        except Exception as e:
            return {"error": f"Routing failed: {str(e)}"}

        try:
            current_coords, current_eta_s = _route_nodes_to_coords_and_eta(
                G_local,
                current_nodes,
                default_speed_kmh=self.DEFAULT_SPEED_KMH,
            )
        except Exception as exc:
            logger.error("Error building route geometry: %s", exc)
            return {"error": "Failed to build route geometry"}

        features = []

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[lon, lat] for lat, lon in current_coords],
            },
            "properties": {
                "eta_s": current_eta_s,
                "role": "current",
            },
        })

        if (
            no_traffic_nodes is not None
            and no_traffic_coords is not None
            and no_traffic_nodes != current_nodes
        ):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lon, lat] for lat, lon in no_traffic_coords],
                },
                "properties": {
                    "eta_s": no_traffic_eta_s,
                    "role": "no_traffic",
                },
            })

        fc = {
            "type": "FeatureCollection",
            "features": features,
            "properties": {
                "start": {"lat": start[0], "lon": start[1]},
                "end": {"lat": end[0], "lon": end[1]},
                "compute_time_s": time.time() - t0,
            },
        }

        if time.time() - t0 > self.REQUEST_TIMEOUT:
            raise RuntimeError("Route computation exceeded timeout")

        return fc