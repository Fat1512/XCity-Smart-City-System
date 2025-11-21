from typing import List, Dict, Any, Optional, Tuple
import requests
from shapely.geometry import Point
from osmnx.projection import project_geometry
from osmnx.distance import nearest_edges

def get_sensors_from_orion(ngsi_url: str, sensor_type: str, timeout: float = 3.0) -> List[Dict[str, Any]]:
    try:
        r = requests.get(f"{ngsi_url}/entities?type={sensor_type}", timeout=timeout)
        if r.status_code != 200:
            return []
        return r.json()
    except Exception:
        return []

def project_lonlat_to_xy(Gp_local, lon: float, lat: float) -> Tuple[float, float]:
    g = Point(lon, lat)
    gproj, _ = project_geometry(g, to_crs=Gp_local.graph.get("crs"))
    return gproj.x, gproj.y
