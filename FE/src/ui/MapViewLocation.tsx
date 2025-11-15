import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DEFAULT_LAT, DEFAULT_LNG } from "../utils/appConstant";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapViewProps {
  coordinates?: [number, number];
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
