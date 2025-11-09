import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type { Building } from "./BuildingList";
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
      const features = buildings
        .filter((b) => b.location?.value?.coordinates)
        .map((b) => {
          const coords = b.location.value.coordinates;
          let polygonCoords: number[][] = [];

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

      map.addSource("buildings", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
      });

      map.addLayer({
        id: "building-fill",
        type: "fill",
        source: "buildings",
        paint: {
          "fill-color": "#ff4757",
          "fill-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "building-outline",
        type: "line",
        source: "buildings",
        paint: {
          "line-color": "#ff4757",
          "line-width": 2,
        },
      });

      map.on("mouseenter", "building-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "building-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "building-fill", (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];

        const buildingData = buildings.find(
          (b) => b.id === feature.properties?.id
        );

        const buildingName =
          buildingData?.name?.value || feature.properties?.name || "Unknown";
        const buildingId = feature.properties?.id || "";

        const infoPanel = renderBuildingInfo({
          buildingName,
          buildingId,
          category: buildingData?.category?.value,
          address: buildingData?.address?.value,
          floorsAboveGround: buildingData?.floorsAboveGround?.value,
          floorsBelowGround: buildingData?.floorsBelowGround?.value,
          description: buildingData?.description?.value,
        });

        if (infoPanelRef.current) {
          infoPanelRef.current.remove();
        }

        infoPanelRef.current = infoPanel;
        const container = document.getElementById("info-panel-container");
        if (container) {
          container.appendChild(infoPanel);
        }

        setSelectedBuilding(feature);
      });

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
