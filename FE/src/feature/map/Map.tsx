import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [lng, setLng] = useState(106.6683);
  const [lat, setLat] = useState(10.7626);
  const [zoom, setZoom] = useState(14);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11");
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) setMapStyle("mapbox://styles/mapbox/dark-v11");
    else if (hour >= 5 && hour < 8)
      setMapStyle("mapbox://styles/mapbox/outdoors-v12");
    else if (hour >= 8 && hour < 17)
      setMapStyle("mapbox://styles/mapbox/streets-v12");
    else setMapStyle("mapbox://styles/mapbox/satellite-streets-v12");
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [lng, lat],
      zoom,
      pitch: 60,
      bearing: -20,
      antialias: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      mapboxgl: mapboxgl,
      marker: false,
    });
    map.addControl(geocoder, "top-left");

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setLng(lng);
      setLat(lat);
    });

    map.on("load", () => {
      add3DBuildings(map);
      addTerrain(map);
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-size:14px;">
          <strong>📍 Marker</strong><br/>
          <span>Longitude:</span> ${lng.toFixed(4)}<br/>
          <span>Latitude:</span> ${lat.toFixed(4)}
        </div>`
      );

      const marker = new mapboxgl.Marker({ color: "#ff4757" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      setMarkers((prev) => [...prev, marker]);
    });

    return () => map.remove();
  }, [mapStyle]);

  const add3DBuildings = (map: mapboxgl.Map) => {
    const layers = map.getStyle().layers;
    const labelLayerId = layers?.find(
      (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
    )?.id;

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#aaa",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            16,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            16,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.7,
        },
      },
      labelLayerId
    );
  };

  const addTerrain = (map: mapboxgl.Map) => {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div ref={mapContainerRef} className="flex-1 w-full" />
    </div>
  );
}
