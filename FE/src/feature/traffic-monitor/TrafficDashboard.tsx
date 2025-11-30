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
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import TrafficStatics from "./TrafficStatics";
import useGetAllCamera from "./useGetAllCamera";
import MiniSpinner from "../../ui/MiniSpinner";
import TrafficRealtimeChart from "./TrafficRealtimeChart";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const TrafficDashboard = () => {
  const [viewMode, setViewMode] = useState<"realtime" | "stats">("realtime");
  const { isLoading, cameras } = useGetAllCamera();

  if (isLoading) return <MiniSpinner />;
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">
        🚦 Traffic Monitoring Dashboard
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          className={`px-5 py-2 rounded-xl font-medium transition-all ${
            viewMode === "realtime"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border"
          }`}
          onClick={() => setViewMode("realtime")}
        >
          🔴 Realtime Dashboard
        </button>

        <button
          className={`px-5 py-2 rounded-xl font-medium transition-all ${
            viewMode === "stats"
              ? "bg-blue-600 text-white shadow"
              : "bg-white border"
          }`}
          onClick={() => setViewMode("stats")}
        >
          📈 Statistics
        </button>
      </div>

      {viewMode === "realtime" && (
        <div className="grid grid-cols-2 gap-2">
          {cameras?.map((cam) => (
            <TrafficRealtimeChart
              key={cam.id}
              streamId={cam.id}
              roadName={cam.address.streetAddress}
            />
          ))}
        </div>
      )}

      {viewMode === "stats" && <TrafficStatics cameras={cameras} />}
    </div>
  );
};

export default TrafficDashboard;
