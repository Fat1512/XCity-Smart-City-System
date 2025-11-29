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
from typing import Tuple, Dict, Optional, List
import logging
import osmnx as ox
import networkx as nx
from osmnx.projection import project_geometry
from osmnx.distance import add_edge_lengths
from shapely.geometry import Point
from app.utils import traffic_state

logger = logging.getLogger("route_tool")

_graph = None
_graph_p = None
_graph_loaded = False

def project_lonlat_to_xy(Gp_local, lon: float, lat: float) -> Tuple[float, float]:
    g = Point(lon, lat)
    gproj, _ = project_geometry(g, to_crs=Gp_local.graph.get("crs"))
    return gproj.x, gproj.y

def _nearest_node_fallback(Gp_local, x: float, y: float) -> Optional[int]:
    best = None
    best_d = float("inf")
    for nid, data in Gp_local.nodes(data=True):
        nx_ = data.get("x")
        ny_ = data.get("y")
        if nx_ is None or ny_ is None:
            continue
        d = (nx_ - x) ** 2 + (ny_ - y) ** 2
        if d < best_d:
            best_d = d
            best = nid
    return best

def _k_nearest_nodes_by_xy(Gp_local, x: float, y: float, k: int = 10) -> List[int]:
    items = []
    for nid, data in Gp_local.nodes(data=True):
        nx_ = data.get("x")
        ny_ = data.get("y")
        if nx_ is None or ny_ is None:
            continue
        items.append(((nx_ - x) ** 2 + (ny_ - y) ** 2, nid))
    items.sort(key=lambda t: t[0])
    return [nid for _, nid in items[:k]]

def _find_reachable_node(G_local, Gp_local, x: float, y: float, other_node: Optional[int] = None, mode: str = "either", k: int = 20) -> Optional[int]:
    candidates = _k_nearest_nodes_by_xy(Gp_local, x, y, k=k)
    if not candidates:
        return None
    if other_node is None or other_node not in G_local.nodes:
        return candidates[0]

    if not G_local.is_directed():
        return candidates[0]

    try:
        wcc_map = {}
        for comp in nx.weakly_connected_components(G_local):
            comp_id = id(comp)
            for n in comp:
                wcc_map[n] = comp_id
        other_comp = wcc_map.get(other_node)
    except Exception:
        return candidates[0]

    for n in candidates:
        if wcc_map.get(n) == other_comp:
            if mode == "either":
                return n
            try:
                if mode == "source" and nx.has_path(G_local, n, other_node):
                    return n
                if mode == "target" and nx.has_path(G_local, other_node, n):
                    return n
                if mode == "either" and (nx.has_path(G_local, n, other_node) or nx.has_path(G_local, other_node, n)):
                    return n
            except Exception:
                continue

    return candidates[0]

def _load_graph_cache(center_point: Tuple[float, float] = (10.7769, 106.7009), dist: int = 2000, cache_path: str = "cache/hcm.graphml"):
    global _graph, _graph_p, _graph_loaded
    if _graph is not None and _graph_p is not None and _graph_loaded:
        return _graph, _graph_p

    try:
        logger.info("Loading graph from cache: %s", cache_path)
        _graph = ox.load_graphml(cache_path)
    except Exception:
        logger.info("Cache not found, downloading graph around %s", center_point)
        _graph = ox.graph_from_point(center_point, dist=dist, network_type="drive")
        try:
            ox.save_graphml(_graph, cache_path)
        except Exception:
            pass

    _graph = add_edge_lengths(_graph)
    _graph_p = ox.project_graph(_graph)
    _graph_loaded = True
    return _graph, _graph_p


def _compute_edge_travel_times(G_local, default_speed_kmh: float = 50.0) -> Dict[Tuple[int, int, int], float]:
    edge_tt: Dict[Tuple[int, int, int], float] = {}
    for u, v, k, data in G_local.edges(keys=True, data=True):
        length_m = data.get("length", 1.0)
        maxspeed = data.get("maxspeed")

        if isinstance(maxspeed, list):
            try:
                maxspeed = float(maxspeed[0])
            except Exception:
                maxspeed = None

        try:
            base_speed_kmh = float(maxspeed) if maxspeed else default_speed_kmh
        except Exception:
            base_speed_kmh = default_speed_kmh

        raw_osmid = data.get("osmid") or data.get("id")
        if isinstance(raw_osmid, list):
            segment_id = str(raw_osmid[0])
        else:
            segment_id = str(raw_osmid) if raw_osmid is not None else None

        if segment_id is not None:
            speed_kmh = traffic_state.get_segment_speed(segment_id, base_speed_kmh)
        else:
            speed_kmh = base_speed_kmh
        if segment_id is not None and speed_kmh != base_speed_kmh:
            logger.info(f"[traffic] override speed for segment {segment_id}: {base_speed_kmh} -> {speed_kmh}")

        travel_time_sec = length_m / (speed_kmh * 1000.0 / 3600.0)
        edge_tt[(u, v, k)] = travel_time_sec

    return edge_tt