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
import type { SensorValues } from "../../context/AirQualityContext";
import RealtimeChart from "./RealtimeChart";
import { FaSmog, FaWind, FaCloud, FaBiohazard } from "react-icons/fa";

interface Props {
  dataPoints: SensorValues[];
}

const AirQualityTypeDashboard = ({ dataPoints }: Props) => {
  if (!dataPoints || dataPoints.length === 0) return null;

  const latest = dataPoints[dataPoints.length - 1];

  const metrics = [
    {
      type: "pm25",
      label: "PM2.5",
      color: "rgb(255, 99, 132)",
      gradient: "bg-gradient-to-r from-red-200 to-red-400",
      textColor: "text-red-600",
      icon: <FaSmog size={24} />,
    },
    {
      type: "pm1",
      label: "PM1.0",
      color: "rgb(54, 162, 235)",
      gradient: "bg-gradient-to-r from-blue-200 to-blue-400",
      textColor: "text-blue-600",
      icon: <FaWind size={24} />,
    },
    {
      type: "co2",
      label: "CO2",
      color: "rgb(75, 192, 192)",
      gradient: "bg-gradient-to-r from-teal-200 to-teal-400",
      textColor: "text-teal-600",
      icon: <FaCloud size={24} />,
    },
    {
      type: "o3",
      label: "O3",
      color: "rgb(255, 159, 64)",
      gradient: "bg-gradient-to-r from-orange-200 to-orange-400",
      textColor: "text-orange-600",
      icon: <FaBiohazard size={24} />,
    },
  ] as const;

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        <span className="bg-linear-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
          {dataPoints[0].name} Dashboard
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.type}
            className={`${metric.gradient} flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105`}
          >
            <div className={`mb-2 ${metric.textColor}`}>{metric.icon}</div>
            <div className="text-lg font-medium text-gray-700 mb-1">
              {metric.label}
            </div>
            <div
              className={`text-3xl font-bold ${metric.textColor} drop-shadow`}
            >
              {latest[metric.type]?.toFixed(2) ?? "-"}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const chartData = dataPoints
            .filter((d) => d[metric.type] !== null)
            .map((d) => ({ x: d.dateObserved, y: d[metric.type] as number }));

          return (
            <div
              key={metric.type}
              className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100"
            >
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                <span className={metric.textColor}>{metric.icon}</span>
                {metric.label}
              </h3>
              {chartData.length > 0 ? (
                <RealtimeChart
                  dataPoints={chartData}
                  color={metric.color}
                  label={metric.label}
                />
              ) : (
                <div className="text-center text-gray-400 py-6">
                  No data available
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AirQualityTypeDashboard;
