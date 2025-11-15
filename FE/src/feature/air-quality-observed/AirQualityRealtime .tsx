import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import AirQualityTypeDashboard from "./AirQualityTypeDashboard";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend
);

interface SensorValues {
  pm25: number;
  pm1: number;
  co2: number;
  o3: number;
  temperature?: number;
  dateObserved: number;
}

type DataPoints = Record<string, SensorValues[]>;

const AirQualityRealtime = () => {
  const [dataPoints, setDataPoints] = useState<DataPoints>({});
  const [mode, setMode] = useState<"realtime" | "static">("realtime");
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const resetTimer = () => {
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive(false);
      setDataPoints({});
    }, 10_000);
  };

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/xcity-service/api/v1/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/topic/air-quality", (msg) => {
          if (!msg.body) return;
          const json = JSON.parse(msg.body);
          const sensorId = json.refDevice;

          const timestamp = Date.now();
          const values: SensorValues = {
            pm25: json.pm25,
            pm1: json.pm1,
            co2: json.co2,
            o3: json.o3,
            temperature: json.temperature,
            dateObserved: timestamp,
          };

          setDataPoints((prev) => {
            const updated: DataPoints = { ...prev };
            if (!updated[sensorId]) updated[sensorId] = [];
            updated[sensorId].push(values);
            if (updated[sensorId].length > 10) updated[sensorId].shift();
            return updated;
          });

          resetTimer();
        });
      },
      onWebSocketClose: () => {
        setConnected(false);
        setActive(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, []);

  return (
    <div className="p-6 font-sans bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Realtime Air Quality Dashboard
      </h2>
      <div className="flex justify-center mb-6 space-x-2">
        <button
          onClick={() => setMode("realtime")}
          className={`px-6 py-2 font-semibold rounded-full shadow-md transition-colors duration-200
      ${
        mode === "realtime"
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }`}
        >
          Realtime
        </button>

        <button
          onClick={() => setMode("static")}
          className={`px-6 py-2 font-semibold rounded-full shadow-md transition-colors duration-200
      ${
        mode === "static"
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
      }`}
        >
          Static
        </button>
      </div>

      {connected && !active && (
        <p className="text-orange-500 font-medium text-center text-lg mb-4">
          ⚠️ No data received in last 10 seconds
        </p>
      )}

      {connected && active && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <AirQualityTypeDashboard type="pm25" dataPoints={dataPoints} />
          <AirQualityTypeDashboard type="pm1" dataPoints={dataPoints} />
          <AirQualityTypeDashboard type="co2" dataPoints={dataPoints} />
          <AirQualityTypeDashboard type="o3" dataPoints={dataPoints} />
        </div>
      )}
    </div>
  );
};

export default AirQualityRealtime;
