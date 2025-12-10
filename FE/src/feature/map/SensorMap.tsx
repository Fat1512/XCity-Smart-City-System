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
import { useAirQuality } from "../../context/AirQualityContext";
import type { Location } from "../building/AdminBuilding";
import type { Address } from "../air-quality-observed/AirQualityAdmin";
import { safeNum } from "../../utils/helper";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const METRICS = [
  { key: "pm1", label: "PM1.0", unit: "μg/m³", digits: 1 },
  { key: "pm25", label: "PM2.5", unit: "μg/m³", digits: 1 },
  { key: "pm10", label: "PM10", unit: "μg/m³", digits: 1 },
  { key: "co2", label: "CO₂", unit: "ppm", digits: 0 },
  { key: "o3", label: "O₃", unit: "μg/m³", digits: 1 },
  { key: "so2", label: "SO₂", unit: "μg/m³", digits: 1 },
  { key: "temperature", label: "Temperature", unit: "°C", digits: 1 },
  { key: "relativeHumidity", label: "Humidity", unit: "%", digits: 0 },
];
export interface SensorLocation {
  id: string;
  location: Location;
  address: Address;
  name: string;
  airQualityLatest: AirQualityData;
}

interface AirQualityData {
  pm25: number;
  pm1: number;
  co2: number;
  o3: number;
  temperature?: number;
  dateObserved: string;
}
interface SensorMapProps {
  sensorLocations: SensorLocation[];
}

const SensorMap = ({ sensorLocations }: SensorMapProps) => {
  const { dataPoints } = useAirQuality();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const circlesRef = useRef<Record<string, string>>({});
  const [selectedSensor, setSelectedSensor] = useState<{
    id: string;
    name: string;
    data: any;
  } | null>(null);
  console.log(selectedSensor);
  const getAirQualityColor = (pm25: number | null) => {
    if (pm25 === null) return "#6b7280";
    if (pm25 <= 12) return "#10b981";
    if (pm25 <= 35.4) return "#fbbf24";
    if (pm25 <= 55.4) return "#f97316";
    if (pm25 <= 150.4) return "#ef4444";
    if (pm25 <= 250.4) return "#9333ea";
    return "#7f1d1d";
  };

  const getAirQualityLabel = (pm25: number | null) => {
    if (pm25 === null) return "No Data";
    if (pm25 <= 12) return "Good";
    if (pm25 <= 35.4) return "Moderate";
    if (pm25 <= 55.4) return "Unhealthy for Sensitive";
    if (pm25 <= 150.4) return "Unhealthy";
    if (pm25 <= 250.4) return "Very Unhealthy";
    return "Hazardous";
  };

  const getRadiusFromPM25 = (pm25: number | null) => {
    if (pm25 === null) return 200;
    if (pm25 <= 12) return 300;
    if (pm25 <= 35.4) return 400;
    if (pm25 <= 55.4) return 500;
    if (pm25 <= 150.4) return 600;
    if (pm25 <= 250.4) return 700;
    return 800;
  };

  const createCircle = (
    center: [number, number],
    radiusInMeters: number,
    color: string
  ) => {
    const points = 64;
    const coords = [];
    const distanceX =
      radiusInMeters / (111320 * Math.cos((center[1] * Math.PI) / 180));
    const distanceY = radiusInMeters / 110574;

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = distanceX * Math.cos(angle);
      const dy = distanceY * Math.sin(angle);
      coords.push([center[0] + dx, center[1] + dy]);
    }
    coords.push(coords[0]);

    return {
      type: "Feature" as const,
      properties: { color },
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
    };
  };

  const updateCircles = () => {
    if (!mapRef.current) return;

    const features = sensorLocations.map((sensor) => {
      const sensorData = dataPoints[sensor.id] || [sensor.airQualityLatest];

      const latestData = sensorData?.[sensorData.length - 1];

      const pm25 = latestData?.pm25 ?? null;
      const coords: [number, number] = [
        sensor.location.coordinates[0],
        sensor.location.coordinates[1],
      ];
      const radius = getRadiusFromPM25(pm25);
      const color = getAirQualityColor(pm25);

      return createCircle(coords, radius, color);
    });

    const source = mapRef.current.getSource(
      "sensor-circles"
    ) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: "FeatureCollection",
        features,
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [106.6619, 10.7602],
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("sensor-circles", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "sensor-circles-layer",
        type: "fill",
        source: "sensor-circles",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "sensor-circles-outline",
        type: "line",
        source: "sensor-circles",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.4,
        },
      });

      sensorLocations.forEach((sensor) => {
        const sensorData = dataPoints[sensor.id] || [sensor.airQualityLatest];
        const latestData = sensorData?.[sensorData.length - 1];

        const pm25 = latestData?.pm25 ?? null;

        const el = document.createElement("div");
        el.className = "sensor-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = getAirQualityColor(pm25);
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontWeight = "bold";
        el.style.color = "white";
        el.style.fontSize = "12px";
        el.textContent = pm25 !== null ? pm25.toFixed(0) : "?";

        // Add click handler
        el.addEventListener("click", () => {
          setSelectedSensor({
            id: sensor.id,
            name: sensor.name || sensor.id,
            data: latestData,
          });
        });

        const coords: number[] = sensor.location.coordinates;
        const marker = new mapboxgl.Marker(el)
          .setLngLat([coords[0], coords[1]])
          .addTo(map);

        markersRef.current[sensor.id] = marker;

        // Store circle info
        circlesRef.current[sensor.id] = sensor.id;
      });

      // Update circles
      updateCircles();
    });

    return () => {
      map.remove();
      markersRef.current = {};
    };
  }, [sensorLocations]);

  useEffect(() => {
    updateCircles();

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const sensorData = dataPoints[id] || [
        sensorLocations.find((s) => s.id === id)?.airQualityLatest,
      ];
      console.log(dataPoints);
      const latestData = sensorData?.[sensorData.length - 1];
      const pm25 = latestData?.pm25 ?? null;

      const el = marker.getElement();
      if (el) {
        el.style.backgroundColor = getAirQualityColor(pm25);
        el.textContent = pm25 !== null ? pm25.toFixed(0) : "?";

        el.onclick = () => {
          const location = sensorLocations.find((l) => l.id === id);
          if (location) {
            setSelectedSensor({
              id: id,
              name: location.name || location.id,
              data: latestData,
            });
          }
        };
      }
    });
  }, [dataPoints, sensorLocations]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popupElement = document.querySelector(
        ".sensor-popup"
      ) as HTMLElement | null;

      if (popupElement && !popupElement.contains(event.target as Node)) {
        setSelectedSensor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Sensor Info Panel - Top Right */}
      {selectedSensor && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "380px",
            maxHeight: "calc(100vh - 20px)",
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            zIndex: 1000,
          }}
        >
          {/* Header with Close Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              borderBottom: `3px solid ${getAirQualityColor(
                selectedSensor.data?.pm25
              )}`,
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                fontSize: "20px",
                color: "#1f2937",
                margin: 0,
              }}
            >
              {selectedSensor.name}
            </h3>
            <button
              onClick={() => setSelectedSensor(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6b7280",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
                e.currentTarget.style.color = "#1f2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "20px" }}>
            {selectedSensor.data ? (
              <div className="sensor-popup">
                {/* PM2.5 special card */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    padding: "16px",
                    borderRadius: "10px",
                    borderLeft: `5px solid ${getAirQualityColor(
                      selectedSensor.data.pm25
                    )}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    PM2.5
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "36px",
                        fontWeight: 700,
                        color: getAirQualityColor(selectedSensor.data.pm25),
                      }}
                    >
                      {safeNum(selectedSensor.data.pm25, 1)}
                    </span>
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>
                      μg/m³
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: getAirQualityColor(selectedSensor.data.pm25),
                      marginTop: "6px",
                    }}
                  >
                    {getAirQualityLabel(selectedSensor.data.pm25)}
                  </div>
                </div>

                {/* Dynamic metrics */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  {METRICS.filter((m) => m.key !== "pm25").map((m) => {
                    const val = selectedSensor.data[m.key];

                    return (
                      <div
                        key={m.key}
                        style={{
                          background: "#f9fafb",
                          padding: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginBottom: "4px",
                            fontWeight: 500,
                          }}
                        >
                          {m.label}
                        </div>

                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#1f2937",
                          }}
                        >
                          {safeNum(val, m.digits)}
                        </div>

                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                          {m.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🕒 Last updated:{" "}
                  {new Date(selectedSensor.data.dateObserved).toLocaleString()}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: "#9ca3af",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "10px",
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        <h4
          style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px" }}
        >
          Air Quality Index (PM2.5)
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#10b981",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "12px" }}>Good (0-12)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#fbbf24",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "12px" }}>Moderate (12-35)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#f97316",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "12px" }}>Unhealthy (35-55)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#ef4444",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "12px" }}>Very Unhealthy (55-150)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#9333ea",
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ fontSize: "12px" }}>Hazardous (150+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorMap;
