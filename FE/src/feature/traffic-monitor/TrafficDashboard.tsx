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

import TrafficStatics from "./TrafficStatics";
import useGetAllCamera from "./useGetAllCamera";
import MiniSpinner from "../../ui/MiniSpinner";
import TrafficRealtimeChart from "./TrafficRealtimeChart";

const TrafficDashboard = () => {
  const [viewMode, setViewMode] = useState<"realtime" | "stats">("realtime");
  const { isLoading, cameras } = useGetAllCamera();

  if (isLoading) return <MiniSpinner />;
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent h-[45px] bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
        Traffic Monitoring Dashboard
      </h1>

      <div className="flex gap-4 mb-8">
        {["realtime", "stats"].map((mode) => (
          <button
            key={mode}
            className={`px-6 cursor-pointer py-3 font-semibold rounded-3xl transition-all duration-300 transform ${
              viewMode === mode
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:scale-105"
                : "bg-white text-gray-700 border border-gray-300 hover:shadow-lg hover:scale-105"
            }`}
            onClick={() => setViewMode(mode as "realtime" | "stats")}
          >
            {mode === "realtime" ? "🔴 Realtime Dashboard" : "📈 Statistics"}
          </button>
        ))}
      </div>

      {viewMode === "realtime" && (
        <div className="grid grid-cols-2 gap-2">
          {cameras?.map((cam) => (
            <TrafficRealtimeChart
              key={cam.id}
              streamId={cam.id}
              roadName={`${cam.address.streetAddress}, ${cam.address.addressLocality}, ${cam.address.addressRegion}`}
            />
          ))}
        </div>
      )}

      {viewMode === "stats" && <TrafficStatics cameras={cameras} />}
    </div>
  );
};

export default TrafficDashboard;
