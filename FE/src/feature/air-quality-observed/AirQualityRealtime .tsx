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
import AirQualityDashboardAdvanced from "./dashboard/AirQualityDashboardStatics";

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
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-8 h-[45px] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Realtime Air Quality Dashboard
      </h2>
      <div className="flex gap-4 mb-8">
        {[
          { label: "Realtime", value: "realtime", color: "blue" },
          { label: "Static", value: "static", color: "green" },
        ].map((btn) => (
          <button
            key={btn.value}
            className={`px-6 cursor-pointer py-3 font-semibold rounded-3xl transition-all duration-300 transform ${
              mode === btn.value
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => setMode(btn.value as "realtime" | "static")}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {connected && !active && (
        <p className="text-orange-500 font-medium text-center text-lg mb-4"></p>
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

      {mode === "static" && <AirQualityDashboardAdvanced />}
    </div>
  );
};

export default AirQualityRealtime;
