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
import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import type { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  MAPBOX_TOKEN,
} from "../../utils/appConstant";
import {
  getRoadNameFromCoordinate,
  searchLocation,
} from "../../service/externalAPI";
import useRoutePath, { type GeoJsonRouteResponse } from "./useRoutePath";

interface NominatimLocation {
  display_name: string;
  lat: string;
  lon: string;
}

type Coordinate = [number, number];

const RouterPicker: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);

  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");

  const [startCoord, setStartCoord] = useState<Coordinate | null>(null);
  const [endCoord, setEndCoord] = useState<Coordinate | null>(null);

  const [suggestionsStart, setSuggestionsStart] = useState<NominatimLocation[]>(
    []
  );
  const [suggestionsEnd, setSuggestionsEnd] = useState<NominatimLocation[]>([]);
  const [roadNames, setRoadNames] = useState<string[]>([]);
  const [routeLayerId, setRouteLayerId] = useState<string | null>(null);
  const [routePoints, setRoutePoints] = useState<Coordinate[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [isFetchingRoads, setIsFetchingRoads] = useState(false);
  const { isPending, routing } = useRoutePath();
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: 13,
    });

    return () => {
      map.current?.remove();
    };
  }, [MAPBOX_TOKEN]);

  const debounceSearch = (text: string, callback: (value: string) => void) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => callback(text), 400);
    setDebounceTimer(timer);
  };

  const fetchSuggestions = async (
    query: string,
    setState: React.Dispatch<React.SetStateAction<NominatimLocation[]>>
  ) => {
    if (!query.trim()) return setState([]);

    const data = await searchLocation(query);
    setState(data);
  };

  const handleSelectLocation = (
    loc: NominatimLocation,
    type: "start" | "end"
  ) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const coord: Coordinate = [lon, lat];

    if (!map.current) return;

    new mapboxgl.Marker({ color: type === "start" ? "green" : "red" })
      .setLngLat(coord)
      .addTo(map.current);

    map.current.flyTo({ center: coord as LngLatLike, zoom: 15 });

    if (type === "start") {
      setStartText(loc.display_name);
      setStartCoord(coord);
      setSuggestionsStart([]);
      if (endCoord) drawRoute(coord, endCoord);
    } else {
      setEndText(loc.display_name);
      setEndCoord(coord);
      setSuggestionsEnd([]);
      if (startCoord) drawRoute(startCoord, coord);
    }
  };

  const drawRoute = async (start: Coordinate, end: Coordinate) => {
    if (!map.current || !routing) return;

    routing(
      {
        start: [start[1], start[0]],
        end: [end[1], end[0]],
      },
      {
        onSuccess: async (data: GeoJsonRouteResponse) => {
          const feature = data.features?.[0];
          if (!feature) return;

          const route = feature.geometry;
          setRoutePoints(route.coordinates);

          if (routeLayerId && map.current.getSource(routeLayerId)) {
            if (map.current.getLayer(routeLayerId))
              map.current.removeLayer(routeLayerId);
            map.current.removeSource(routeLayerId);
          }

          const id = "route-" + Date.now();
          map.current.addSource(id, {
            type: "geojson",
            data: { type: "Feature", geometry: route },
          });
          map.current.addLayer({
            id,
            type: "line",
            source: id,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-width": 5, "line-color": "#007bff" },
          });
          setRouteLayerId(id);

          if (route.coordinates?.length) {
            const bounds = route.coordinates.reduce(
              (b: mapboxgl.LngLatBounds, coord: [number, number]) =>
                b.extend(coord),
              new mapboxgl.LngLatBounds(
                route.coordinates[0],
                route.coordinates[0]
              )
            );
            map.current.fitBounds(bounds, { padding: 50 });
          }

          setIsFetchingRoads(true);
          const fetchedRoads: string[] = [];
          const seenRoads = new Set<string>();

          for (
            let i = 0;
            i < route.coordinates.length;
            i += Math.ceil(route.coordinates.length / 10)
          ) {
            const [lng, lat] = route.coordinates[i];
            try {
              const data = await getRoadNameFromCoordinate([lng, lat]);
              if (data && !seenRoads.has(data)) {
                fetchedRoads.push(data);
                seenRoads.add(data);
              }
            } catch (err) {
              console.error("Failed to fetch road name:", err);
            }
          }

          setRoadNames(fetchedRoads);
          setIsFetchingRoads(false);
        },
        onError: (err) => console.error("Failed to get route:", err),
      }
    );
  };

  return (
    <div className="w-full relative">
      <div className="p-4 bg-white shadow rounded grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="font-semibold text-gray-700">Điểm bắt đầu</label>
          <input
            className="border p-2 rounded w-full"
            placeholder="Nhập địa điểm..."
            value={startText}
            onChange={(e) => {
              setStartText(e.target.value);
              debounceSearch(e.target.value, (v) =>
                fetchSuggestions(v, setSuggestionsStart)
              );
            }}
          />

          {suggestionsStart.length > 0 && (
            <div className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
              {suggestionsStart.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectLocation(loc, "start")}
                >
                  {loc.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="font-semibold text-gray-700">Điểm kết thúc</label>
          <input
            className="border p-2 rounded w-full"
            placeholder="Nhập địa điểm..."
            value={endText}
            onChange={(e) => {
              setEndText(e.target.value);
              debounceSearch(e.target.value, (v) =>
                fetchSuggestions(v, setSuggestionsEnd)
              );
            }}
          />

          {suggestionsEnd.length > 0 && (
            <div className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
              {suggestionsEnd.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectLocation(loc, "end")}
                >
                  {loc.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {startCoord &&
        startCoord.length > 0 &&
        endCoord &&
        endCoord.length > 0 &&
        routePoints.length > 0 && (
          <div className="absolute top-[115px] left-2.5 right-4 w-64 bg-white shadow-lg rounded-lg p-4 max-h-[400px] overflow-y-auto z-50">
            <h3 className="font-semibold mb-2 text-gray-800">
              Danh sách các tuyến đường:
            </h3>
            {isFetchingRoads ? (
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            ) : (
              <ul className="text-sm space-y-1">
                {roadNames.length > 0 ? (
                  roadNames.map((name, idx) => (
                    <li
                      key={idx}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-blue-100 transition"
                    >
                      {idx + 1}. {name}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Chưa có dữ liệu</li>
                )}
              </ul>
            )}
          </div>
        )}
      <div className="w-full h-[600px]">
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
};

export default RouterPicker;
