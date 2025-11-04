import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { IoLocationOutline } from "react-icons/io5";
import { FaCrosshairs } from "react-icons/fa";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapLocationProps {
  lat?: number;
  lng?: number;
}

export default function MapLocation({ lat, lng }: MapLocationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const geocoderContainer = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({
    lat: lat ?? 10.772, // Trung tâm Quận 10
    lng: lng ?? 106.667,
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    // 🗺️ Khởi tạo bản đồ
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [coords.lng, coords.lat],
      zoom: 13,
    });

    // 📍 Thêm marker ban đầu
    marker.current = new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map.current);

    // 🔍 Thêm geocoder (tìm kiếm)
    if (geocoderContainer.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl,
        placeholder: "Tìm vị trí...",
        marker: false,
      });

      geocoderContainer.current.innerHTML = "";
      geocoderContainer.current.appendChild(geocoder.onAdd(map.current));

      geocoder.on("result", (e) => {
        const [lng, lat] = e.result.center;
        setCoords({ lat, lng });
        marker.current?.setLngLat([lng, lat]);
        map.current?.flyTo({ center: [lng, lat], zoom: 14 });
      });
    }

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });
      marker.current?.setLngLat([lng, lat]);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLngLat([coords.lng, coords.lat]);
      map.current.setCenter([coords.lng, coords.lat]);
    }
  }, [coords]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ Geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        map.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
      },
      () => alert("Không thể lấy vị trí hiện tại!")
    );
  };

  return (
    <section className="bg-white p-5 rounded-lg shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase mb-4">
        <IoLocationOutline className="text-green-600" /> Vị trí
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-gray-500 mb-1 text-sm">Latitude</label>
          <input
            type="number"
            step="any"
            value={coords.lat}
            onChange={(e) =>
              setCoords({ ...coords, lat: parseFloat(e.target.value) })
            }
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1 text-sm">Longitude</label>
          <input
            type="number"
            step="any"
            value={coords.lng}
            onChange={(e) =>
              setCoords({ ...coords, lng: parseFloat(e.target.value) })
            }
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleGetCurrentLocation}
        className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition"
      >
        <FaCrosshairs /> Lấy vị trí hiện tại
      </button>

      <div
        ref={geocoderContainer}
        className="mt-4 w-full border border-gray-200 rounded"
      />

      <div
        ref={mapContainer}
        className="mt-4 border border-gray-300 rounded-lg h-64"
      />
    </section>
  );
}
