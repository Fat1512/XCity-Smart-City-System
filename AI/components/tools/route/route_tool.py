from typing import Tuple, Dict, Any, Optional, List
import time
import logging

from components.interfaces import Tool
from components.logging.logger import setup_logger
from .graph import _load_graph_cache, _find_reachable_node, _compute_edge_travel_times, _nearest_node_fallback
from .utils import _route_nodes_to_coords_and_eta, DEFAULT_SPEED_KMH, REQUEST_TIMEOUT

logger = setup_logger("route_tool")

class RouteTool(Tool):
    name = "route_tool"
    description = "Compute shortest driving route between two coordinates (lat, lon). Returns GeoJSON FeatureCollection."
    category = "geo"
    enabled = True

    # configurable defaults (can be overridden on instance)
    GRAPH_CENTER = (10.7769, 106.7009)
    GRAPH_DIST = 2000
    GRAPH_CACHE = "cache/hcm.graphml"
    DEFAULT_SPEED_KMH = DEFAULT_SPEED_KMH
    USE_SENSORS = False
    NGSI_URL = "http://localhost:1026/ngsi-ld/v1"
    SENSOR_TYPE = "TrafficSensor"
    SIMULATED_EDGE_DELAY = {}
    SIMULATED_SCALE = 1.0
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

        # compute and attach travel_time to edges
        try:
            edge_tt = _compute_edge_travel_times(
                G_local, Gp_local,
                default_speed_kmh=self.DEFAULT_SPEED_KMH,
                use_sensors=self.USE_SENSORS,
                ngsi_url=self.NGSI_URL,
                sensor_type=self.SENSOR_TYPE,
                simulated_scale=self.SIMULATED_SCALE,
                simulated_edge_delay=self.SIMULATED_EDGE_DELAY
            )
            for (u, v, k), tt in edge_tt.items():
                if (u, v, k) in G_local.edges(keys=True):
                    G_local[u][v][k]["travel_time"] = tt
                else:
                    data = G_local.get_edge_data(u, v)
                    if data:
                        first_k = list(data.keys())[0]
                        G_local[u][v][first_k]["travel_time"] = tt
        except Exception as exc:
            logger.warning("Failed computing edge travel times: %s", exc)

        # parse start/end (expect [lat, lon]) and project to xy
        try:
            sx, sy = Gp_local.graph.get("crs") and (None, None)  # just to hint; real projection done below
            # project lon/lat to xy using project_geometry via graph module function
            # use same logic as original to catch exceptions
            from .sensors import project_lonlat_to_xy
            sx, sy = project_lonlat_to_xy(Gp_local, float(start[1]), float(start[0]))
            ex, ey = project_lonlat_to_xy(Gp_local, float(end[1]), float(end[0]))
        except Exception as exc:
            logger.error("Invalid start/end coordinates: %s", exc)
            raise RuntimeError("start/end must be [lat, lon]")

        # find nearest usable nodes
        start_node = end_node = None
        try:
            start_node = _find_reachable_node(G_local, Gp_local, sx, sy, other_node=None, mode='either', k=30)
            end_node = _find_reachable_node(G_local, Gp_local, ex, ey, other_node=start_node, mode='target', k=40)
            if start_node is None:
                from osmnx.distance import nearest_nodes as _nn
                start_node = _nn(Gp_local, sx, sy)
            if end_node is None:
                from osmnx.distance import nearest_nodes as _nn
                end_node = _nn(Gp_local, ex, ey)
        except Exception:
            try:
                from osmnx.distance import nearest_nodes as _nn
                start_node = _nn(Gp_local, sx, sy)
                end_node = _nn(Gp_local, ex, ey)
            except Exception:
                start_node = _nearest_node_fallback(Gp_local, sx, sy)
                end_node = _nearest_node_fallback(Gp_local, ex, ey)

        logger.debug("Start node: %s, End node: %s", start_node, end_node)

        # compute shortest path preferring travel_time
        try:
            import networkx as nx
            route_nodes = nx.shortest_path(G_local, start_node, end_node, weight='travel_time')
        except Exception:
            import networkx as nx
            route_nodes = nx.shortest_path(G_local, start_node, end_node)

        # assemble coordinates and ETA
        try:
            route_coords, eta_s = _route_nodes_to_coords_and_eta(G_local, route_nodes, default_speed_kmh=self.DEFAULT_SPEED_KMH)
        except Exception as exc:
            logger.warning("Failed to build dense route geometry, falling back to node coordinates: %s", exc)
            route_coords = []
            for n in route_nodes:
                node = G_local.nodes[n]
                lat = node.get('y') if node.get('y') is not None else node.get('lat')
                lon = node.get('x') if node.get('x') is not None else node.get('lon')
                route_coords.append((lat, lon))
            eta_s = 0.0
            for i in range(len(route_nodes) - 1):
                u = route_nodes[i]; v = route_nodes[i + 1]
                data_dict = G_local.get_edge_data(u, v)
                if not data_dict:
                    continue
                first_k = list(data_dict.keys())[0]
                length_m = data_dict[first_k].get('length', 100.0)
                eta_s += length_m / (self.DEFAULT_SPEED_KMH * 1000.0 / 3600.0)

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [[lon, lat] for lat, lon in route_coords]
            },
            "properties": {"eta_s": eta_s}
        }

        fc = {"type": "FeatureCollection", "features": [feature], "properties": {
            "start": {"lat": start[0], "lon": start[1]},
            "end": {"lat": end[0], "lon": end[1]},
            "computed_at": time.time(),
            "compute_time_s": time.time() - t0
        }}

        if time.time() - t0 > self.REQUEST_TIMEOUT:
            logger.error("Route computation exceeded timeout (%.2fs)", time.time() - t0)
            raise RuntimeError("Route computation exceeded timeout")

        logger.info("Route computed in %.3fs (eta_s=%.1f)", time.time() - t0, eta_s)
        return fc

    def get_function_schema(self) -> Optional[Dict]:
        return {
            "name": "get_route",
            "description": self.description,
            "parameters": {
                "type": "object",
                "properties": {
                    "start": {"type": "array", "items": [{"type":"number"}, {"type":"number"}], "description": "[lat, lon]"},
                    "end": {"type": "array", "items": [{"type":"number"}, {"type":"number"}], "description": "[lat, lon]"}
                },
                "required": ["start", "end"]
            }
        }
