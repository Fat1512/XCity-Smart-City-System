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
import { useEffect, useMemo, useState } from "react";
import "chartjs-adapter-date-fns";
import CreatableSelect from "react-select/creatable";
import useGetSensorMap from "../../map/useGetSensorMap";
import type { SensorLocation } from "../../map/SensorMap";

import useGetAirQualityMonthlyStatics from "./useGetAirQualityMonthlyStatics";
import MiniSpinner from "../../../ui/MiniSpinner";
import AirQualityChartNonData from "./AirQualityChartNonData";
import DownloadSection from "./DownloadSection";
import AirQualityStaticChart from "./AirQualityStaticChart";
import MetadataAccordion from "../../../ui/MetadataAccordion";

interface SensorValues {
  pm25: number | null;
  pm1: number | null;
  co2: number | null;
  o3: number | null;
  dateObserved: number;
}

interface Sensor {
  id: string;
  name: string;
  dataPoints: SensorValues[];
}

const COLORS = [
  "#EF4444",
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#F97316",
  "#EC4899",
  "#14B8A6",
];

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? "#4F46E5" : "#E5E7EB",
    borderWidth: "2px",
    borderRadius: "12px",
    padding: "4px",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(79, 70, 229, 0.1)" : "none",
    "&:hover": { borderColor: "#4F46E5" },
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: "#EEF2FF",
    borderRadius: "8px",
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: "#4F46E5",
    fontWeight: "500",
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#4F46E5",
    "&:hover": { backgroundColor: "#4F46E5", color: "white" },
  }),
};

const getCurrentDate = () => new Date().toISOString().split("T")[0];
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const AirQualityDashboard4Charts = () => {
  const [selectedSensors, setSelectedSensors] = useState<Sensor[]>([]);

  const [timeUnit, setTimeUnit] = useState<"hour" | "day">("day");
  const [viewMode, setViewMode] = useState<"day" | "month">("month");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const { isLoading, devices } = useGetSensorMap();

  const staticsStrategy =
    viewMode === "month"
      ? {
          sensorId: selectedSensors[selectedSensors.length - 1]?.id,
          year: selectedMonth.slice(0, 4),
          month: selectedMonth.slice(5, 7),
        }
      : {
          sensorId: selectedSensors[selectedSensors.length - 1]?.id,
          date: selectedDate,
        };

  const { isLoading: isStaticsting, statics } = useGetAirQualityMonthlyStatics({
    mode: viewMode,
    staticsStrategy,
  });

  const sensorOptions = useMemo(
    () =>
      devices?.map((device: SensorLocation) => ({
        value: device.id,
        label: device.name,
      })) || [],
    [devices]
  );

  const chartTypes = useMemo(
    () => ["pm25", "pm1", "pm10", "o3", "co2", "temperature"] as const,
    []
  );

  const handleViewModeChange = (mode: "day" | "month") => {
    setViewMode(mode);
    setTimeUnit(mode === "day" ? "hour" : "day");
  };

  const handleSensorChange = (vals: any) => {
    setSelectedSensors((prev) => {
      if (!vals || vals.length === 0) {
        return [];
      }

      const newSelected = vals.map((v: any) => {
        const existInPrev = prev.find((p: Sensor) => p.id === v.value);
        if (existInPrev) {
          return existInPrev;
        }

        const exist = devices?.find((s: SensorLocation) => s.id === v.value);
        return exist
          ? { ...exist, dataPoints: [] }
          : { id: v.value, name: v.label, dataPoints: [] };
      });

      return newSelected;
    });
  };

  useEffect(() => {
    setSelectedSensors([]);
  }, [selectedMonth]);

  useEffect(() => {
    if (!statics || selectedSensors.length === 0) return;
    setSelectedSensors((prev) =>
      prev.map((sensor) =>
        sensor.id === statics.sensorId
          ? {
              ...sensor,
              dataPoints: statics.dataPoints.map((s: any) => ({
                dateObserved: timeUnit === "hour" ? s.hour : s.day,
                pm25: s.avgPm25 ?? 0,
                pm1: s.avgPm1 ?? 0,
                pm10: s.avgPm10 ?? 0,
                co2: s.avgCo2 ?? 0,
                o3: s.avgO3 ?? 0,
                temperature: s.avgTemperature ?? 0,
              })),
            }
          : sensor
      )
    );
  }, [statics, timeUnit]);

  const allChartsData = useMemo(() => {
    const allTimestamps = Array.from(
      new Set(
        selectedSensors.flatMap((s) => s.dataPoints?.map((d) => d.dateObserved))
      )
    ).sort((a, b) => a - b);

    return chartTypes.reduce((acc, type) => {
      const datasets = selectedSensors.map((sensor, idx) => {
        const color = COLORS[idx % COLORS.length];
        const dataMap = new Map(
          sensor.dataPoints?.map((dp) => [dp.dateObserved, dp[type]])
        );

        return {
          label: sensor.name,
          data: allTimestamps.map((t) => ({
            x: t,
            y: dataMap.get(t) ?? null,
          })),
          borderColor: color,
          backgroundColor: color + "33",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
        };
      });

      acc[type] = { datasets };
      return acc;
    }, {} as Record<keyof SensorValues, { datasets: any[] }>);
  }, [selectedSensors, chartTypes]);

  return (
    <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-linear-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <label className="font-semibold text-gray-800">
                  Chọn sensor để so sánh
                </label>
              </div>
              <CreatableSelect
                isMulti
                value={selectedSensors.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                options={sensorOptions}
                onChange={handleSensorChange}
                placeholder="🔍 Gõ hoặc chọn sensor..."
                styles={selectStyles}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-linear-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <label className="font-semibold text-gray-800">
                    Chế độ xem
                  </label>
                </div>
                <select
                  value={viewMode}
                  onChange={(e) =>
                    handleViewModeChange(e.target.value as "day" | "month")
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white font-medium text-gray-700 hover:border-green-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 cursor-pointer"
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-linear-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <label className="font-semibold text-gray-800">
                    {viewMode === "day" ? "Chọn ngày" : "Chọn tháng"}
                  </label>
                </div>
                {viewMode === "day" ? (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white font-medium text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 cursor-pointer"
                  />
                ) : (
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white font-medium text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {selectedSensors.length > 0 && (
              <>
                <DownloadSection
                  selectedSensors={selectedSensors}
                  viewMode={viewMode}
                  selectedDate={selectedDate}
                  selectedMonth={selectedMonth}
                />
                <MetadataAccordion />
              </>
            )}
          </div>
        </div>
        {isStaticsting ? (
          <MiniSpinner />
        ) : selectedSensors.length === 0 ? (
          <AirQualityChartNonData />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chartTypes.map((type, index) => (
              <AirQualityStaticChart
                key={type}
                type={type}
                index={index}
                chartData={allChartsData[type]}
                timeUnit={timeUnit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityDashboard4Charts;
