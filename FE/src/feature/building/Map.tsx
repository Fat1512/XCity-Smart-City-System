import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { Building } from "../building/BuildingList";
import { renderBuildingInfo } from "./BuildingPopup";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapProps {
  buildings: Building[];
}

export default function Map({ buildings }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [lng, setLng] = useState(106.6619);
  const [lat, setLat] = useState(10.7602);
  const [zoom, setZoom] = useState(17);

  // State để lưu building được chọn khi click marker
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !buildings) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom,
      pitch: 60,
      bearing: -20,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      // Chuyển dữ liệu NGSI-LD thành FeatureCollection hợp lệ
      const features = buildings
        .filter((b) => b.location?.value?.coordinates)
        .map((b) => {
          const coords = b.location.value.coordinates;
          let polygonCoords: number[][] = [];

          // Nếu coordinates là mảng phẳng: [lng1, lat1, lng2, lat2, ...]
          if (Array.isArray(coords) && typeof coords[0] === "number") {
            for (let i = 0; i < coords.length; i += 2) {
              polygonCoords.push([coords[i], coords[i + 1]]);
            }
          } else {
            // Nested array
            polygonCoords = coords[0] as number[][];
          }

          return {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [polygonCoords],
            },
            properties: {
              id: b.id,
              name: b.name?.value || b.id,
            },
          };
        });

      // Add GeoJSON source
      map.addSource("buildings", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      });

      // Layer fill
      map.addLayer({
        id: "building-fill",
        type: "fill",
        source: "buildings",
        paint: {
          "fill-color": "#ff4757",
          "fill-opacity": 0.3,
        },
      });

      // Layer outline
      map.addLayer({
        id: "building-outline",
        type: "line",
        source: "buildings",
        paint: {
          "line-color": "#ff4757",
          "line-width": 2,
        },
      });

      // Thay đổi con trỏ chuột khi hover vào building
      map.on("mouseenter", "building-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "building-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      // Click vào vùng building để hiện info panel
      map.on("click", "building-fill", (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];

        // Tìm building data từ mảng buildings
        const buildingData = buildings.find(
          (b) => b.id === feature.properties?.id
        );

        const buildingName =
          buildingData?.name?.value || feature.properties?.name || "Unknown";
        const buildingId = feature.properties?.id || "";

        // Tạo info panel element với thông tin đầy đủ
        const infoPanel = renderBuildingInfo({
          buildingName,
          buildingId,
          category: buildingData?.category?.value,
          address: buildingData?.address?.value,
          floorsAboveGround: buildingData?.floorsAboveGround?.value,
          floorsBelowGround: buildingData?.floorsBelowGround?.value,
          description: buildingData?.description?.value,
        });

        // Xóa panel cũ nếu có
        if (infoPanelRef.current) {
          infoPanelRef.current.remove();
        }

        // Thêm panel mới vào container góc phải
        infoPanelRef.current = infoPanel;
        const container = document.getElementById("info-panel-container");
        if (container) {
          container.appendChild(infoPanel);
        }

        setSelectedBuilding(feature);
      });

      // Vẫn giữ markers để dễ nhìn thấy vị trí trung tâm
      features.forEach((feature) => {
        const centroid = turf.centroid(feature);
        const [markerLng, markerLat] = centroid.geometry.coordinates as [
          number,
          number
        ];

        new mapboxgl.Marker({ color: "#ff4757" })
          .setLngLat([markerLng, markerLat])
          .addTo(map);
      });
    });

    return () => map.remove();
  }, [buildings]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Container cho info panel góc phải */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }} id="info-panel-container"></div>
      </div>
    </div>
  );
}
