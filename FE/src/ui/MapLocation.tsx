import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapLocationProps {
  coordinates?: number[][]; // [[lng, lat], ...]
}

export default function MapLocation({ coordinates }: MapLocationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Khởi tạo map
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.7, 10.776],
      zoom: 15,
    });
    mapRef.current = map;

    if (coordinates && coordinates.length > 2) {
      const polygon = turf.polygon([coordinates]);

      const center = turf.centerOfMass(polygon).geometry.coordinates;

      map.on("load", () => {
        map.addSource("selected-area", {
          type: "geojson",
          data: polygon,
        });

        map.addLayer({
          id: "selected-area-fill",
          type: "fill",
          source: "selected-area",
          paint: {
            "fill-color": "#1d4ed8",
            "fill-opacity": 0.35,
          },
        });

        map.addLayer({
          id: "selected-area-outline",
          type: "line",
          source: "selected-area",
          paint: {
            "line-color": "#1d4ed8",
            "line-width": 2,
          },
        });

        // Fit map
        const bbox = turf.bbox(polygon);
        map.fitBounds(bbox as mapboxgl.LngLatBoundsLike, { padding: 40 });

        // Marker ở giữa polygon
        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat(center)
          .addTo(map);
      });
    }

    return () => map.remove();
  }, [coordinates]);

  return (
    <div
      className="border border-gray-300 rounded-lg h-64"
      ref={mapContainer}
    />
  );
}
