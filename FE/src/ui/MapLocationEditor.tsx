import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapLocationEditorProps {
  coordinates?: number[][]; // [[lng, lat], ...]
  onConfirm?: (coords: number[][]) => void;
}

export default function MapLocationEditor({
  coordinates,
  onConfirm,
}: MapLocationEditorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const [mode, setMode] = useState<"point" | "polygon">("point");
  const [tempCoords, setTempCoords] = useState<number[][]>([]);
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates?.[0] || [106.7, 10.776],
      zoom: 15,
    });
    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: "simple_select",
    });
    drawRef.current = draw;
    map.addControl(draw);

    if (coordinates && coordinates.length > 0) {
      if (mode === "point") {
        markerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat(coordinates[0])
          .addTo(map);
        setTempCoords([coordinates[0]]);
      } else if (mode === "polygon" && coordinates.length > 2) {
        draw.add({
          type: "Feature",
          properties: {},
          geometry: turf.polygon([coordinates]).geometry,
        });
        map.fitBounds(
          turf.bbox(turf.polygon([coordinates])) as mapboxgl.LngLatBoundsLike,
          { padding: 40 }
        );
        setTempCoords(coordinates);
      }
    }

    map.on("draw.update", updateDraw);
    map.on("draw.create", updateDraw);
    map.on("draw.delete", updateDraw);

    return () => map.remove();
  }, [coordinates, mode]);

  const updateDraw = () => {
    if (!drawRef.current) return;
    const data = drawRef.current.getAll();
    if (
      data.features.length > 0 &&
      data.features[0].geometry.type === "Polygon"
    ) {
      const coords = data.features[0].geometry.coordinates[0];
      setTempCoords(coords);
    } else {
      setTempCoords([]);
    }
  };

  const toggleMode = (newMode: "point" | "polygon") => {
    setMode(newMode);
    setTempCoords([]);
    markerRef.current?.remove();
    drawRef.current?.deleteAll();
  };

  const handleMapClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (mode === "point") {
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(mapRef.current!);
      setTempCoords([[e.lngLat.lng, e.lngLat.lat]]);
    }
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [mode]);

  const handleConfirm = () => {
    if (tempCoords.length === 0) return;
    onConfirm?.(tempCoords);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <p
          className={`px-3 py-1 rounded ${
            mode === "point" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => toggleMode("point")}
        >
          Point
        </p>
        <p
          className={`px-3 py-1 rounded ${
            mode === "polygon" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => toggleMode("polygon")}
        >
          Polygon
        </p>
        {tempCoords.length > 0 && (
          <p
            className="px-3 py-1 rounded bg-green-600 text-white"
            onClick={handleConfirm}
          >
            Confirm
          </p>
        )}
      </div>
      <div
        className="border border-gray-300 rounded-lg h-96"
        ref={mapContainer}
      />
    </div>
  );
}
