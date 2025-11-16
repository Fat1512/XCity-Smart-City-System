import { useState } from "react";
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

import { useAirQuality } from "../../context/AirQualityContext";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Legend
);

const AirQualityRealtime = () => {
  const { dataPoints, connected, active } = useAirQuality();
  const [mode, setMode] = useState<"realtime" | "static">("realtime");

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

      {connected && active && mode === "realtime" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(dataPoints).map((sensorId) => (
            <AirQualityTypeDashboard
              key={sensorId}
              dataPoints={dataPoints[sensorId]}
            />
          ))}
        </div>
      )}

      {mode === "static" && (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-xl">Static mode - Coming soon</p>
        </div>
      )}
    </div>
  );
};

export default AirQualityRealtime;
