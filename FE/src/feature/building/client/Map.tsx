// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type {
  Address,
  Location,
} from "../../air-quality-observed/AirQualityAdmin";
import BuildingPopup from "./BuildingPopup";
import { DEFAULT_LAT, DEFAULT_LNG } from "../../../utils/appConstant";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export interface Building {
  id: string;
  name: string;
  description: string;
  address: Address;
  dateModified?: string;
  category?: string[];
  dataProvider?: string;
  dateCreated?: string;
  location?: Location;
}

interface MapProps {
  buildings: Building[];
}

export default function Map({ buildings }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [zoom, setZoom] = useState(17);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );

  useEffect(() => {
    if (!mapContainerRef.current || !buildings) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom,
      pitch: 60,
      bearing: -20,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
      )?.id;

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        },
        labelLayerId
      );

      buildings.forEach((b) => {
        if (!b.location?.coordinates) return;
        const [markerLng, markerLat] = b.location.coordinates;

        const marker = new mapboxgl.Marker({ color: "#ff4757" })
          .setLngLat([markerLng, markerLat])
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setSelectedBuilding(b);
        });
      });
    });

    return () => map.remove();
  }, [buildings]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainerRef} className="w-full h-full" />

      {selectedBuilding && (
        <BuildingPopup
          id={selectedBuilding.id}
          name={selectedBuilding.name}
          description={selectedBuilding.description}
          address={selectedBuilding.address}
          coordinates={selectedBuilding.location?.coordinates || [0, 0]}
          onClose={() => setSelectedBuilding(null)}
        />
      )}
    </div>
  );
}
