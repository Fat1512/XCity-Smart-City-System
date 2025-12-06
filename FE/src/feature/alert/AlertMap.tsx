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
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { Button } from "@mui/material";
import AlertModal from "./AlertModal";
import useGetAllAlert from "./useGetAllAlert";
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  MAPBOX_TOKEN,
} from "../../utils/appConstant";
import AlertDetail, { type Alert } from "./AlertDetail";

const ALERT_COLORS: Record<string, string> = {
  traffic: "#ef4444", // Đỏ giao thông
  naturalDisaster: "#b91c1c", // Đỏ đậm thiên tai
  weather: "#3b82f6", // Xanh dương thời tiết
  environment: "#22c55e", // Xanh lá môi trường
  health: "#a21caf", // Tím sức khỏe
  security: "#f59e0b", // Vàng an ninh
  agriculture: "#84cc16", // Xanh vàng nông nghiệp
};

const AlertMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { isLoading, alerts } = useGetAllAlert();

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [DEFAULT_LNG, DEFAULT_LAT],
      zoom: 12,
    });

    const map = mapRef.current;

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Tìm kiếm địa điểm...",
    });
    map.addControl(geocoder, "top-left");

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([lng, lat])
        .addTo(map);
      map.flyTo({ center: [lng, lat], zoom: 14 });
    });
  }, []);

  useEffect(() => {
    if (isLoading || !mapRef.current || !alerts) return;

    const map = mapRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const geojsonData = {
      features: alerts.map((a: Alert) => ({
        type: "Feature",
        properties: {
          id: a.id,
          alertData: JSON.stringify(a),
          category: a.category,
        },
        geometry: { type: "Point", coordinates: a.location.coordinates },
      })),
    };

    const addAlertLayers = () => {
      if (!map.getSource("alerts")) {
        map.addSource("alerts", {
          type: "geojson",
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "alert-points",
          type: "circle",
          source: "alerts",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match",
              ["get", "category"],
              "traffic",
              "#ef4444",
              "naturalDisaster",
              "#b91c1c",
              "weather",
              "#3b82f6",
              "environment",
              "#22c55e",
              "health",
              "#a21caf",
              "security",
              "#f59e0b",
              "agriculture",
              "#84cc16",
              "#6b7280",
            ],
            "circle-radius": 10,
            "circle-stroke-width": 3,
            "circle-stroke-color": "#fff",
            "circle-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "alerts",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#fca5a5",
              5,
              "#f87171",
              10,
              "#ef4444",
              20,
              "#dc2626",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              25,
              10,
              30,
              20,
              35,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#fff",
            "circle-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "alerts",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 14,
          },
          paint: {
            "text-color": "#fff",
            "text-halo-color": "#ef4444",
            "text-halo-width": 1,
          },
        });
      } else {
        (map.getSource("alerts") as mapboxgl.GeoJSONSource).setData(
          geojsonData
        );
      }

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties!.cluster_id;
        (
          map.getSource("alerts") as mapboxgl.GeoJSONSource
        ).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom + 1,
          });
        });
      });

      map.on("click", "alert-points", (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const alertData = JSON.parse(feature.properties!.alertData);
        setSelectedAlert(alertData);

        map.flyTo({
          center: (feature.geometry as any).coordinates,
          zoom: 15,
          duration: 1000,
        });
      });

      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "alert-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "alert-points", () => {
        map.getCanvas().style.cursor = "";
      });
    };

    if (map.isStyleLoaded()) {
      addAlertLayers();
    } else {
      map.on("load", addAlertLayers);
    }

    return () => {
      if (map.getLayer("alert-points")) {
        map.off("click", "alert-points");
      }
      if (map.getLayer("clusters")) {
        map.off("click", "clusters");
      }
    };
  }, [isLoading, alerts]);

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-5 right-6 z-20">
        <Button
          variant="contained"
          color="error"
          className="shadow-lg"
          onClick={() => {
            setOpen(true);
          }}
        >
          Tạo yêu cầu
        </Button>
      </div>

      {selectedAlert && (
        <div className="absolute top-8 left-3 z-30 max-w-md">
          <AlertDetail
            onClose={() => setSelectedAlert(null)}
            selectedAlert={selectedAlert}
          />
        </div>
      )}

      <AlertModal open={open} setOpen={setOpen} />
      <div
        ref={mapContainerRef}
        className="w-full absolute z-10 h-screen rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default AlertMap;
