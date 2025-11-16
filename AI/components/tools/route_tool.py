from typing import Tuple, Dict, Any, Optional, List
import time
import logging
import requests

import osmnx as ox
import networkx as nx
from shapely.geometry import Point, LineString, mapping
from osmnx.projection import project_geometry

from components.interfaces import Tool

# ---------- logger ----------
logger = logging.getLogger("route_tool")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)

# ---------- defaults (can be overridden on class/instance) ----------
DEFAULT_SPEED_KMH = 50.0
GRAPH_CENTER = (10.7769, 106.7009)
# GRAPH_CENTER = (40.7258, -73.9945)
GRAPH_DIST = 2000
GRAPH_CACHE = "cache/hcm.graphml"
USE_SENSORS = False
NGSI_URL = "http://localhost:1026/ngsi-ld/v1"
SENSOR_TYPE = "TrafficSensor"
SIMULATED_EDGE_DELAY: Dict = {}
SIMULATED_SCALE = 1.0

# ---------- internal graph cache ----------
_graph = None
_graph_p = None
_graph_loaded = False


# ---------- helpers ----------
def _nearest_node_fallback(Gp_local, x: float, y: float) -> Optional[int]:
    """Linear scan fallback to find the closest node (projected coords)."""
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
    """Return k nearest node IDs by Euclidean distance in projected space."""
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

    # for directed graphs, prefer nodes in the same weakly connected component
    try:
        wcc_map = {}
        for comp in nx.weakly_connected_components(G_local):
            comp_id = id(comp)
            for n in comp:
                wcc_map[n] = comp_id
        other_comp = wcc_map.get(other_node)
    except Exception:
        logger.debug("Failed building WCC map, returning first candidate")
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
                # path checks can fail on large graphs - ignore and try next candidate
                continue

    # last resort: return first candidate
    return candidates[0]


def _load_graph_cache(center_point: Tuple[float, float] = GRAPH_CENTER, dist: int = GRAPH_DIST, cache_path: str = GRAPH_CACHE):
    """Load graph from cache or download a new one. Returns (G, Gp)."""
    global _graph, _graph_p, _graph_loaded
    if _graph is not None and _graph_p is not None and _graph_loaded:
        logger.debug("Using cached graph")
        return _graph, _graph_p

    try:
        logger.info("Loading graph from cache: %s", cache_path)
        _graph = ox.load_graphml(cache_path)
    except Exception:
        logger.info("Cache not found or failed to load, downloading graph around %s (dist=%s)", center_point, dist)
        _graph = ox.graph_from_point(center_point, dist=dist, network_type="drive")
        try:
            ox.save_graphml(_graph, cache_path)
            logger.debug("Saved graph to cache")
        except Exception:
            logger.debug("Failed to save graph cache (ignored)")

    # ensure edge lengths and project
    from osmnx.distance import add_edge_lengths
    _graph = add_edge_lengths(_graph)
    _graph_p = ox.project_graph(_graph)
    _graph_loaded = True
    return _graph, _graph_p


def _project_lonlat_to_xy(Gp_local, lon: float, lat: float) -> Tuple[float, float]:
    g = Point(lon, lat)
    gproj, _ = project_geometry(g, to_crs=Gp_local.graph.get("crs"))
    return gproj.x, gproj.y


def _get_sensors_from_orion(ngsi_url: str, sensor_type: str) -> List[Dict[str, Any]]:
    try:
        r = requests.get(f"{ngsi_url}/entities?type={sensor_type}", timeout=3)
        if r.status_code != 200:
            return []
        return r.json()
    except Exception:
        logger.debug("Failed to fetch sensors from Orion")
        return []


def _compute_edge_travel_times(G_local, Gp_local, default_speed_kmh: float = DEFAULT_SPEED_KMH, use_sensors: bool = USE_SENSORS, ngsi_url: str = NGSI_URL, sensor_type: str = SENSOR_TYPE, simulated_scale: float = SIMULATED_SCALE, simulated_edge_delay: Dict = None) -> Dict[Tuple[int, int, int], float]:
    simulated_edge_delay = simulated_edge_delay or {}
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
            speed_kmh = float(maxspeed) if maxspeed else default_speed_kmh
        except Exception:
            speed_kmh = default_speed_kmh
        tt = length_m / (speed_kmh * 1000.0 / 3600.0)
        edge_tt[(u, v, k)] = tt

    if use_sensors:
        sensors = _get_sensors_from_orion(ngsi_url, sensor_type)
        from osmnx.distance import nearest_edges
        for s in sensors:
            loc = s.get("location") or s.get("Location") or s.get("geo")
            if not loc:
                continue
            coords = None
            if isinstance(loc, dict):
                val = loc.get("value")
                if isinstance(val, dict) and "coordinates" in val:
                    coords = val["coordinates"]
                elif "coordinates" in loc:
                    coords = loc["coordinates"]
            if not coords or len(coords) < 2:
                continue
            lon = float(coords[0]); lat = float(coords[1])
            try:
                x, y = _project_lonlat_to_xy(Gp_local, lon, lat)
            except Exception:
                continue
            try:
                u, v, k = nearest_edges(Gp_local, x, y)
            except Exception:
                continue

            avg = s.get("avgSpeed", {}).get("value")
            vc = s.get("vehicleCount", {}).get("value")
            try:
                avg_v = float(avg) if avg is not None else None
            except Exception:
                avg_v = None
            try:
                vc_v = float(vc) if vc is not None else None
            except Exception:
                vc_v = None

            # find an edge length
            if (u, v, k) in G_local.edges(keys=True):
                length_m = G_local[u][v][k].get("length", 1.0)
            else:
                data_dict = G_local.get_edge_data(u, v)
                if data_dict:
                    first_k = list(data_dict.keys())[0]
                    length_m = G_local[u][v][first_k].get("length", 1.0)
                    k = first_k
                else:
                    length_m = 100.0

            if avg_v and avg_v > 0:
                tt = length_m / (avg_v * 1000.0 / 3600.0)
                if vc_v:
                    capacity = 30.0
                    alpha = 0.5
                    factor = 1 + alpha * min(3.0, vc_v / capacity)
                    tt = tt * factor
                edge_tt[(u, v, k)] = tt

    # apply simulation scale and delays
    for key in list(edge_tt.keys()):
        tt = float(edge_tt[key]) * simulated_scale
        if key in simulated_edge_delay:
            tt += float(simulated_edge_delay[key])
        edge_tt[key] = tt

    return edge_tt


def _route_nodes_to_coords_and_eta(G_local, route_nodes: List[int], default_speed_kmh: float = DEFAULT_SPEED_KMH) -> Tuple[List[Tuple[float, float]], float]:
    coords: List[Tuple[float, float]] = []
    eta_s = 0.0

    for i in range(len(route_nodes) - 1):
        u = route_nodes[i]
        v = route_nodes[i + 1]
        data_dict = G_local.get_edge_data(u, v)
        if not data_dict:
            continue
        chosen_k = None
        chosen_attr = None
        for k, attr in data_dict.items():
            if "travel_time" in attr:
                chosen_k = k
                chosen_attr = attr
                break
        if chosen_k is None:
            chosen_k = list(data_dict.keys())[0]
            chosen_attr = data_dict[chosen_k]

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
                udata = G_local.nodes[u]
                vdata = G_local.nodes[v]
                pts_latlon = [(udata.get("y"), udata.get("x")), (vdata.get("y"), vdata.get("x"))]
        else:
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

    return coords, eta_s


# ---------- RouteTool class ----------
class RouteTool(Tool):
    name = "route_tool"
    description = "Compute shortest driving route between two coordinates (lat, lon). Returns GeoJSON FeatureCollection."
    category = "geo"
    enabled = True

    # configurable defaults (can be overridden on instance)
    GRAPH_CENTER = GRAPH_CENTER
    GRAPH_DIST = GRAPH_DIST
    GRAPH_CACHE = GRAPH_CACHE
    DEFAULT_SPEED_KMH = DEFAULT_SPEED_KMH
    USE_SENSORS = USE_SENSORS
    NGSI_URL = NGSI_URL
    SENSOR_TYPE = SENSOR_TYPE
    SIMULATED_EDGE_DELAY = SIMULATED_EDGE_DELAY
    SIMULATED_SCALE = SIMULATED_SCALE
    REQUEST_TIMEOUT = 300

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
            edge_tt = _compute_edge_travel_times(G_local, Gp_local, default_speed_kmh=self.DEFAULT_SPEED_KMH, use_sensors=self.USE_SENSORS, ngsi_url=self.NGSI_URL, sensor_type=self.SENSOR_TYPE, simulated_scale=self.SIMULATED_SCALE, simulated_edge_delay=self.SIMULATED_EDGE_DELAY)
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
            sx, sy = _project_lonlat_to_xy(Gp_local, float(start[1]), float(start[0]))
            ex, ey = _project_lonlat_to_xy(Gp_local, float(end[1]), float(end[0]))
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
            route_nodes = nx.shortest_path(G_local, start_node, end_node, weight='travel_time')
        except Exception:
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
