import logging
import time
from typing import Tuple, List, Dict, Any, Optional
from shapely.geometry import LineString
from shapely.geometry import Point
from shapely.geometry import mapping
from components.logging.logger import setup_logger


logger = setup_logger("route_tool")


DEFAULT_SPEED_KMH = 50.0
GRAPH_CENTER = (16.0681, 108.2131)
GRAPH_DIST = 2000
GRAPH_CACHE = "cache/danang.graphml"
USE_SENSORS = False
NGSI_URL = "http://localhost:1026/ngsi-ld/v1"
SENSOR_TYPE = "TrafficSensor"
SIMULATED_EDGE_DELAY: Dict = {}
SIMULATED_SCALE = 1.0

REQUEST_TIMEOUT = 300

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
