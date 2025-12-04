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
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MapPin, Navigation, Search } from "lucide-react";

import { DEFAULT_LAT, DEFAULT_LNG } from "../utils/appConstant";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapEditProps {
  coordinates?: [number, number];
  height?: string;
  onChange?: (coords: [number, number]) => void;
}

export default function MapEditLocation({
  coordinates,
  height = "h-96",
  onChange,
}: MapEditProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [lng, setLng] = useState(coordinates?.[0] ?? DEFAULT_LNG);
  const [lat, setLat] = useState(coordinates?.[1] ?? DEFAULT_LAT);
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates || [DEFAULT_LNG, DEFAULT_LAT],
      zoom: 15,
    });
    mapRef.current = map;

    map.on("zoom", () => {
      setZoom(Math.round(map.getZoom() * 10) / 10);
    });

    const addMarker = (lngLat: [number, number]) => {
      markerRef.current?.remove();

      markerRef.current = new mapboxgl.Marker({ draggable: true, color: "red" })
        .setLngLat(lngLat)
        .addTo(mapRef.current!);

      setLng(lngLat[0]);
      setLat(lngLat[1]);

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLngLat();
        setLng(pos.lng);
        setLat(pos.lat);
        onChange?.([pos.lng, pos.lat]);
      });
    };

    if (coordinates) addMarker(coordinates);

    const handleClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      addMarker([e.lngLat.lng, e.lngLat.lat]);
      onChange?.([e.lngLat.lng, e.lngLat.lat]);
    };
    map.on("click", handleClick);

    // Geocoder (Search)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl,
      marker: false,
      placeholder: "Search for a location...",
    });

    map.addControl(geocoder, "top-left");
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    geocoder.on("result", (e: any) => {
      const coords: [number, number] = [e.result.center[0], e.result.center[1]];
      addMarker(coords);
      onChange?.(coords);
      map.flyTo({ center: coords, zoom: 15, duration: 1500 });
    });

    return () => {
      map.off("click", handleClick);
      map.remove();
    };
  }, [coordinates, onChange]);

  const handleManualGo = () => {
    const coords: [number, number] = [
      parseFloat(lng as any),
      parseFloat(lat as any),
    ];
    if (!isNaN(coords[0]) && !isNaN(coords[1])) {
      markerRef.current?.remove();

      markerRef.current = new mapboxgl.Marker({ draggable: true, color: "red" })
        .setLngLat(coords)
        .addTo(mapRef.current!);

      mapRef.current!.flyTo({ center: coords, zoom: 15, duration: 1500 });
      onChange?.(coords);

      markerRef.current.on("dragend", () => {
        const pos = markerRef.current!.getLngLat();
        setLng(pos.lng);
        setLat(pos.lat);
        onChange?.([pos.lng, pos.lat]);
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="bg-white p-4 border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              Longitude
            </label>
            <input
              type="number"
              step="any"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter longitude"
              value={lng}
              onChange={(e) => setLng(parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Latitude
            </label>
            <input
              type="number"
              step="any"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="Enter latitude"
              value={lat}
              onChange={(e) => setLat(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <button
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          onClick={handleManualGo}
        >
          <Search className="w-4 h-4" />
          Go to Location
        </button>
      </div>

      <div className="relative">
        <div
          ref={mapContainer}
          className="border-gray-200 rounded-xl w-full h-96 shadow-lg overflow-hidden"
        />

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-xs font-medium text-gray-600">Zoom Level</div>
          <div className="text-lg font-bold text-indigo-600">{zoom}x</div>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 max-w-xs">
          <div className="text-xs font-medium text-gray-600 mb-1">
            Current Position
          </div>
          <div className="text-sm font-mono text-gray-800">
            {lng.toFixed(6)}, {lat.toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}
