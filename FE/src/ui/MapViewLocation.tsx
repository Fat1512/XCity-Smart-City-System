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
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DEFAULT_LAT, DEFAULT_LNG } from "../utils/appConstant";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapViewProps {
  coordinates?: number[];
  height?: string;
}

export default function MapViewLocation({ coordinates, height }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates || [DEFAULT_LNG, DEFAULT_LAT],
      zoom: 15,
    });
    mapRef.current = map;

    if (coordinates) {
      map.on("load", () => {
        new mapboxgl.Marker({ color: "red" }).setLngLat(coordinates).addTo(map);
      });
    }

    return () => map.remove();
  }, [coordinates]);

  return (
    <div
      ref={mapContainer}
      className={`border border-gray-300 rounded-lg w-full ${height || "h-64"}`}
    />
  );
}
