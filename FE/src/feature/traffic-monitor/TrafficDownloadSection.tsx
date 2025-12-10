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

import { FORMAT } from "../../utils/appConstant";
import type { TrafficChartData } from "./TrafficStatics";
import type { CameraOverviewResponse } from "./useGetAllCamera";

interface TrafficDownloadProps {
  chartData: TrafficChartData;
  cameras: CameraOverviewResponse[];
  viewDate: string;
}

const TrafficDownloadSection: React.FC<TrafficDownloadProps> = ({
  chartData,
  cameras,
  viewDate,
}) => {
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    const headers = [
      "refDevice",
      "Address",
      "dateObserved",
      "averageVehicleSpeed",
      "intensity",
    ];
    const rows: string[] = [headers.join(",")];

    Object.entries(chartData).forEach(([id, data]) => {
      const cam = cameras.find((c) => c.id === id);
      const addressParts = [
        cam?.address.streetNr,
        cam?.address.streetAddress,
        cam?.address.district,
        cam?.address.addressLocality,
        cam?.address.addressRegion,
      ].filter(Boolean);
      const fullAddress = addressParts.join(", ");

      for (let hour = 0; hour < 24; hour++) {
        const localDate = new Date(
          `${viewDate}T${hour.toString().padStart(2, "0")}:00:00`
        );
        const isoUTC = localDate.toISOString();
        rows.push(
          [
            id,
            `"${fullAddress}"`,
            `"${isoUTC}"`,
            data.avgSpeed[hour] ?? "",
            data.intensity[hour] ?? "",
          ].join(",")
        );
      }
    });

    downloadFile(rows.join("\n"), `traffic_${viewDate}.csv`, "text/csv");
  };

  const downloadAsJSON = () => {
    const data = Object.entries(chartData).flatMap(([id, data]) => {
      const cam = cameras.find((c) => c.id === id);

      return data.avgSpeed.map((speed, idx) => {
        const dateObserved = new Date(
          `${viewDate}T${idx.toString().padStart(2, "0")}:00:00`
        ).toISOString();

        return {
          id: `${id}_${idx}`,
          type: "TrafficFlowObserved",
          averageVehicleSpeed: speed ?? null,
          address: cam?.address,
          refDevice: id,
          dateObserved: dateObserved,
          intensity: data.intensity[idx] ?? null,
        };
      });
    });

    downloadFile(
      JSON.stringify(data, null, 2),
      `traffic_${viewDate}.json`,
      "application/json"
    );
  };
  const downloadAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Traffic Data - ${viewDate}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
  .camera-header { background-color: #e3f2fd; font-weight: bold; }
</style>
</head>
<body>
<h1>Traffic Data Report</h1>
<p><strong>Date:</strong> ${viewDate}</p>
${Object.entries(chartData)
  .map(([id, data]) => {
    const cam = cameras.find((c) => c.id === id);
    const address = cam
      ? [
          cam.address.streetNr,
          cam.address.streetAddress,
          cam.address.district,
          cam.address.addressLocality,
          cam.address.addressRegion,
        ]
          .filter(Boolean)
          .join(", ")
      : id;

    return `

<table>
  <thead>
    <tr>
    <th>Ref Device</th>
    <th>Date Observed (UTC)</th>
    <th>Address</th>
    <th>Average Vehicle Speed</th>
    <th>Intensity</th>
    <th>Type</th>
    </tr>
  </thead>
  <tbody>
    ${data.avgSpeed
      .map((speed, hour) => {
        const paddedHour = hour.toString().padStart(2, "0");
        const dateObserved = new Date(
          `${viewDate}T${paddedHour}:00:00`
        ).toISOString();
        return `
      <tr>
        <td>${id}</td>
        <td>${dateObserved}</td>
        <td>${address}</td>
        <td>${speed ?? ""}</td>
        <td>${data.intensity[hour] ?? ""}</td>
        <td>TrafficFlowObserved</td>
      </tr>`;
      })
      .join("")}
  </tbody>
</table>`;
  })
  .join("")}
</body>
</html>`;

    downloadFile(
      htmlContent,
      `traffic_${viewDate}.html`,
      "text/html;charset=utf-8"
    );
  };

  const handleDownload = (format: string) => {
    switch (format) {
      case "CSV":
        downloadAsCSV();
        break;
      case "JSON":
        downloadAsJSON();
        break;
      case "HTML":
        downloadAsHTML();
        break;

      //   case "RDF":
      //     downloadAsRDF();
      // break;
      default:
        console.warn("Unsupported format:", format);
    }
  };

  return (
    <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </div>
        <label className="font-semibold text-gray-800">
          Tải xuống dữ liệu mở
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FORMAT.map(({ label, color, icon }) => (
          <button
            key={label}
            onClick={() => handleDownload(label)}
            className={`flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-${color}-200 text-${color}-700 font-semibold rounded-xl hover:bg-${color}-50 hover:border-${color}-400 focus:outline-none focus:ring-4 focus:ring-${color}-100 transition-all duration-200 transform hover:scale-105`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={icon}
              />
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
export default TrafficDownloadSection;
