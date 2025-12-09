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
import os
import osmnx as ox
import networkx as nx
from typing import List, Dict, Any

from components.logging.logger import setup_logger

logger = setup_logger("map_service")

class MapService:
    def __init__(self, cache_path="cache/hcm.graphml"):
        ox.settings.use_cache = True
        ox.settings.log_console = False
        
        self.cache_path = cache_path
        self.graph = None
        
        self._load_graph()

    def _load_graph(self):
        if os.path.exists(self.cache_path):
            logger.info(f"MapService: Loading graph from cache: {self.cache_path}")
            try:
                self.graph = ox.load_graphml(self.cache_path)
                
                logger.info("MapService: Ensuring graph is in Lat/Lon (EPSG:4326)...")
                self.graph = ox.project_graph(self.graph, to_crs="EPSG:4326")
                     
                logger.info("MapService: Graph loaded and standardized.")
            except Exception as e:
                logger.error(f"MapService: Failed to load cache: {e}")
                self.graph = None
        else:
            logger.error(f"MapService: Cache file not found at {self.cache_path}. Running in Online Mode.")

    def get_nearby_segments(self, lat: float, lon: float, radius: int = 50) -> List[Dict[str, Any]]:
        G_sub = None
        
        if self.graph:
            try:
                G_sub = ox.truncate.truncate_graph_dist(self.graph, (lat, lon), dist=radius)
                
                if len(G_sub.nodes) == 0:
                    raise ValueError("Empty subgraph found in cache")
                    
            except Exception as e:
                G_sub = None

        if G_sub is None:
            try:
                logger.info(f"MapService: Downloading map snippet from OSM for ({lat}, {lon})...")
                G_sub = ox.graph_from_point((lat, lon), dist=radius, network_type='drive')
            except Exception as e:
                logger.error(f"Error downloading from OSM: {e}")
                return []

        segments = []
        seen_ids = set()

        try:
            for u, v, key, data in G_sub.edges(keys=True, data=True):
                name = data.get("name", "Unnamed Road")
                if isinstance(name, list): 
                    name = " / ".join(name)
                
                osm_id = data.get("osmid")
                if isinstance(osm_id, list): 
                    osm_id = osm_id[0]
                osm_id_str = str(osm_id)

                if osm_id_str in seen_ids: 
                    continue
                seen_ids.add(osm_id_str)

                node_u = G_sub.nodes[u]
                node_v = G_sub.nodes[v]
                
                lat_u, lon_u = node_u.get('y'), node_u.get('x')
                lat_v, lon_v = node_v.get('y'), node_v.get('x')
                
                if lat_u is None or lon_u is None:
                    continue 

                segments.append({
                    "segment_id": osm_id_str,
                    "name": name,
                    "highway": data.get("highway", ""),
                    "length": round(data.get("length", 0), 1),
                    "coords": [[lat_u, lon_u], [lat_v, lon_v]]
                })
            
            return segments

        except Exception as e:
            logger.error(f"Error parsing segments: {e}")
            return []