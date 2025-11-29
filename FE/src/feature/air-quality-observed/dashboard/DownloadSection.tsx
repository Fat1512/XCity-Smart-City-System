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
import { FORMAT } from "../../../utils/appConstant";

interface SensorValues {
  pm25: number | null;
  pm1: number | null;
  co2: number | null;
  o3: number | null;
  dateObserved: number;
  temperature?: number;
}

interface Sensor {
  id: string;
  name: string;
  dataPoints: SensorValues[];
}

interface DownloadSectionProps {
  selectedSensors: Sensor[];
  viewMode: "day" | "month";
  selectedDate: string;
  selectedMonth: string;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({
  selectedSensors,
  viewMode,
  selectedDate,
  selectedMonth,
}) => {
  const getDateString = () => {
    return viewMode === "day" ? selectedDate : selectedMonth;
  };

  const formatDateObserved = (dateObserved: number | string) => {
    if (typeof dateObserved === "number") {
      return new Date(dateObserved * 1000).toISOString();
    }

    return dateObserved;
  };

  const formatDateObservedForDisplay = (dateObserved: number | string) => {
    if (typeof dateObserved === "number") {
      return new Date(dateObserved * 1000).toLocaleString();
    }

    return new Date(dateObserved).toLocaleString();
  };

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
      "Sensor ID",
      "Sensor Name",
      "Date/Time",
      "PM2.5",
      "PM1",
      "CO2",
      "O3",
      "Temperature",
    ];
    const csvContent = [
      headers.join(","),
      ...selectedSensors.flatMap((sensor) =>
        sensor.dataPoints.map((point) =>
          [
            sensor.id,
            `"${sensor.name}"`,
            formatDateObserved(point.dateObserved),
            point.pm25 || "",
            point.pm1 || "",
            point.co2 || "",
            point.o3 || "",
            point.temperature || "",
          ].join(",")
        )
      ),
    ].join("\n");

    downloadFile(csvContent, `air_quality_${getDateString()}.csv`, "text/csv");
  };

  const downloadAsJSON = () => {
    console.log(selectedSensors);
    const data = {
      metadata: {
        exportDate: new Date().toISOString(),
        viewMode,
        dateRange: viewMode === "day" ? selectedDate : selectedMonth,
        sensorsCount: selectedSensors.length,
      },
      sensors: selectedSensors.map((sensor) => ({
        id: sensor.id,
        name: sensor.name,
        dataPoints: sensor.dataPoints.map((point) => ({
          ...point,
          dateTime: formatDateObserved(point.dateObserved),
        })),
      })),
    };

    downloadFile(
      JSON.stringify(data, null, 2),
      `air_quality_${getDateString()}.json`,
      "application/json"
    );
  };

  const downloadAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Air Quality Data - ${getDateString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .sensor-header { background-color: #e3f2fd; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Air Quality Data Report</h1>
    <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>View Mode:</strong> ${viewMode}</p>
    <p><strong>Date Range:</strong> ${
      viewMode === "day" ? selectedDate : selectedMonth
    }</p>
    
    ${selectedSensors
      .map(
        (sensor) => `
    <h2>Sensor: ${sensor.name} (ID: ${sensor.id})</h2>
    <table>
        <thead>
            <tr>
                <th>Date/Time</th>
                <th>PM2.5 (µg/m³)</th>
                <th>PM1 (µg/m³)</th>
                <th>CO2 (ppm)</th>
                <th>O3 (µg/m³)</th>
                <th>Temperature (°C)</th>
            </tr>
        </thead>
        <tbody>
            ${sensor.dataPoints
              .map(
                (point) => `
            <tr>
                <td>${formatDateObservedForDisplay(point.dateObserved)}</td>
                <td>${point.pm25 || "N/A"}</td>
                <td>${point.pm1 || "N/A"}</td>
                <td>${point.co2 || "N/A"}</td>
                <td>${point.o3 || "N/A"}</td>
                <td>${point.temperature || "N/A"}</td>
            </tr>
            `
              )
              .join("")}
        </tbody>
    </table>
    `
      )
      .join("")}
</body>
</html>`;

    downloadFile(
      htmlContent,
      `air_quality_${getDateString()}.html`,
      "text/html"
    );
  };

  const downloadAsXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<airQualityData>
    <metadata>
        <exportDate>${new Date().toISOString()}</exportDate>
        <viewMode>${viewMode}</viewMode>
        <dateRange>${
          viewMode === "day" ? selectedDate : selectedMonth
        }</dateRange>
        <sensorsCount>${selectedSensors.length}</sensorsCount>
    </metadata>
    <sensors>
        ${selectedSensors
          .map(
            (sensor) => `
        <sensor id="${sensor.id}" name="${sensor.name}">
            ${sensor.dataPoints
              .map(
                (point) => `
            <dataPoint>
                <dateTime>${formatDateObserved(point.dateObserved)}</dateTime>
                <pm25>${point.pm25 || ""}</pm25>
                <pm1>${point.pm1 || ""}</pm1>
                <co2>${point.co2 || ""}</co2>
                <o3>${point.o3 || ""}</o3>
                <temperature>${point.temperature || ""}</temperature>
            </dataPoint>
            `
              )
              .join("")}
        </sensor>
        `
          )
          .join("")}
    </sensors>
</airQualityData>`;

    downloadFile(
      xmlContent,
      `air_quality_${getDateString()}.xml`,
      "application/xml"
    );
  };

  const downloadAsRDF = () => {
    const rdfContent = `@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix aq: <http://example.org/air-quality/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

${selectedSensors
  .map((sensor, sensorIndex) =>
    sensor.dataPoints
      .map(
        (point, pointIndex) => `
aq:sensor${sensorIndex}_point${pointIndex} rdf:type aq:AirQualityMeasurement ;
    aq:sensorId "${sensor.id}" ;
    aq:sensorName "${sensor.name}" ;
    aq:dateTime "${formatDateObserved(point.dateObserved)}"^^xsd:dateTime ;
    aq:pm25 "${point.pm25 || ""}"^^xsd:double ;
    aq:pm1 "${point.pm1 || ""}"^^xsd:double ;
    aq:co2 "${point.co2 || ""}"^^xsd:double ;
    aq:o3 "${point.o3 || ""}"^^xsd:double ;
    aq:temperature "${point.temperature || ""}"^^xsd:double .
  `
      )
      .join("")
  )
  .join("")}`;

    downloadFile(
      rdfContent,
      `air_quality_${getDateString()}.rdf`,
      "application/rdf+xml"
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
      case "XML":
        downloadAsXML();
        break;
      case "RDF":
        downloadAsRDF();
        break;
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
      <p className="mt-3 text-xs text-gray-500 flex items-center gap-1">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Dữ liệu mở tuân thủ chuẩn quốc tế, phù hợp cho nghiên cứu và tích hợp hệ
        thống
      </p>
    </div>
  );
};

export default DownloadSection;
