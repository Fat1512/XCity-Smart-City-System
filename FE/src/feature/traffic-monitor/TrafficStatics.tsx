import React, { useEffect, useMemo, useState, useCallback } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CreatableSelect from "react-select/creatable";
import type { MultiValue } from "react-select";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import { type CameraOverviewResponse } from "./useGetAllCamera";
import useGetStaticsTraffic from "./useGetStaticsTraffic";
import TrafficDownloadSection from "./TrafficDownloadSection";

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);
export interface TrafficChartData {
  [cameraUrn: string]: TrafficDataPoint;
}
interface TrafficDataPoint {
  avgSpeed: (number | null)[];
  intensity: (number | null)[];
}

const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);
interface TrafficStaticsProps {
  cameras: CameraOverviewResponse[];
}

const TrafficStatics: React.FC<TrafficStaticsProps> = ({ cameras }) => {
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedCameras, setSelectedCameras] = useState<
    CameraOverviewResponse[]
  >([]);
  const [chartData, setChartData] = useState<TrafficChartData>({});

  const { isLoading: loadingStatics, statics } = useGetStaticsTraffic({
    cameraId: selectedCameras.length
      ? selectedCameras[selectedCameras.length - 1].id
      : null,
    date,
  });

  const cameraOptions = useMemo(() => {
    return cameras.map((cam) => ({
      value: cam.id,
      label: cam.address.streetAddress,
    }));
  }, [cameras]);

  const handleCameraChange = useCallback(
    (vals: MultiValue<{ value: string; label: string }>) => {
      if (!vals || vals.length === 0) return setSelectedCameras([]);
      const selected = vals.map((v) => cameras!.find((c) => c.id === v.value)!);
      setSelectedCameras(selected);
    },
    [cameras]
  );

  const handleDateChange = useCallback((newValue: any) => {
    setSelectedCameras([]);
    setDate(newValue?.format("YYYY-MM-DD") || "");
  }, []);

  useEffect(() => {
    if (!selectedCameras.length || loadingStatics || !statics?.dataPoints) {
      setChartData((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([id]) =>
            selectedCameras.some((cam) => cam.id === id)
          )
        )
      );
      return;
    }

    const avgSpeed = Array(24).fill(0);
    const intensity = Array(24).fill(0);

    statics.dataPoints.forEach((point: any) => {
      const hour = new Date(point.hour).getHours();
      avgSpeed[hour] = point.avgSpeed ?? 0;
      intensity[hour] = point.totalIntensity ?? 0;
    });

    const cameraId = selectedCameras[selectedCameras.length - 1].id;

    setChartData((prev) => ({ ...prev, [cameraId]: { avgSpeed, intensity } }));
  }, [selectedCameras, statics, loadingStatics]);

  const speedDatasets = useMemo(
    () =>
      Object.entries(chartData).map(([id, d], idx) => ({
        label: cameras?.find((c) => c.id === id)?.address.streetAddress || id,
        data: d.avgSpeed,
        borderWidth: 3,
        borderColor: `hsl(${idx * 60}, 70%, 50%)`,
        tension: 0.3,
        fill: false,
        pointRadius: 1,
        pointHoverRadius: 6,
      })),
    [chartData, cameras]
  );
  console.log(chartData);
  const intensityDatasets = useMemo(
    () =>
      Object.entries(chartData).map(([id, d], idx) => ({
        label: cameras?.find((c) => c.id === id)?.address.streetAddress || id,
        data: d.intensity,
        backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.5)`,
        borderRadius: 6,
        barThickness: 18,
      })),
    [chartData, cameras]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="w-full space-y-10">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Chọn camera
            </label>
            <CreatableSelect
              isMulti
              options={cameraOptions}
              value={selectedCameras.map((cam) => ({
                value: cam.id,
                label: cam.address.streetAddress,
              }))}
              placeholder="🔍 Gõ hoặc chọn camera..."
              onChange={handleCameraChange}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Chọn ngày
            </label>
            <DatePicker
              value={date ? dayjs(date) : null}
              onChange={handleDateChange}
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </div>
        </div>
        {selectedCameras.length > 0 && (
          <TrafficDownloadSection
            chartData={chartData}
            cameras={selectedCameras}
            viewDate={date}
          />
        )}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Tốc độ trung bình phương tiện
          </h2>
          <Line
            data={{ labels: HOURS, datasets: speedDatasets }}
            options={{
              responsive: true,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: { position: "top", labels: { font: { size: 14 } } },
                tooltip: {
                  mode: "index",
                  intersect: false,
                  backgroundColor: "#1f2937",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  padding: 10,
                  cornerRadius: 8,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Giờ trong ngày",
                    font: { size: 14 },
                  },
                  grid: { display: false },
                },
                y: {
                  title: {
                    display: true,
                    text: "Tốc độ (km/h)",
                    font: { size: 14 },
                  },
                  grid: { color: "#e5e7eb" },
                  min: 0,
                },
              },
            }}
          />
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Lưu lượng phương tiện
          </h2>
          <Bar
            data={{ labels: HOURS, datasets: intensityDatasets }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top", labels: { font: { size: 14 } } },
                tooltip: {
                  backgroundColor: "#1f2937",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  padding: 10,
                  cornerRadius: 8,
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Giờ trong ngày",
                    font: { size: 14 },
                  },
                  grid: { display: false },
                },
                y: {
                  title: {
                    display: true,
                    text: "Lưu lượng (xe/giờ)",
                    font: { size: 14 },
                  },
                  grid: { color: "#e5e7eb" },
                  min: 0,
                },
              },
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default TrafficStatics;
