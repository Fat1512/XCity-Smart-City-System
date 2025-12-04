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
export interface AQDataPoint {
  timestamp: string;
  pm25: number | null;
  pm1: number | null;
  o3: number | null;
  co2: number | null;
}

export interface AQMergedSensor {
  id: string;
  name: string;
  dataPoints: AQDataPoint[];
}

export interface AQExportMetadata {
  exportDate: string;
  viewMode: string;
  selectedDate: string;
  timeRange: { start: string; end: string } | null;
  timeUnit: string;
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
};

export const exportCSV = (sensors: AQMergedSensor[], filename: string) => {
  const headers = ["Sensor", "Timestamp", "PM2.5", "PM1", "O3", "CO2"];

  const rows = sensors.flatMap((s) =>
    s.dataPoints.map((dp) => [
      s.name,
      dp.timestamp,
      dp.pm25 ?? "",
      dp.pm1 ?? "",
      dp.o3 ?? "",
      dp.co2 ?? "",
    ])
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });

  triggerDownload(blob, filename + ".csv");
};

export const exportJSON = (
  sensors: AQMergedSensor[],
  metadata: AQExportMetadata,
  filename: string
) => {
  const blob = new Blob([JSON.stringify({ metadata, sensors }, null, 2)], {
    type: "application/json",
  });

  triggerDownload(blob, filename + ".json");
};

export const exportHTML = (
  sensors: AQMergedSensor[],
  metadata: AQExportMetadata,
  filename: string
) => {
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Air Quality Report</title>
  <style>
    body { font-family: Arial; background: #f5f5f5; padding: 20px; }
    .container { background: white; padding: 20px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; border-bottom: 1px solid #ddd; }
    th { background: #2563eb; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Báo cáo chất lượng không khí</h1>
    <p><strong>Ngày xuất:</strong> ${metadata.exportDate}</p>
    <p><strong>Chế độ xem:</strong> ${metadata.viewMode}</p>
    <p><strong>Ngày/tháng:</strong> ${metadata.selectedDate}</p>

    ${sensors
      .map(
        (s) => `
      <h2>${s.name}</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th><th>PM2.5</th><th>PM1</th><th>O3</th><th>CO2</th>
          </tr>
        </thead>
        <tbody>
          ${s.dataPoints
            .map(
              (dp) => `
            <tr>
              <td>${dp.timestamp}</td>
              <td>${dp.pm25 ?? ""}</td>
              <td>${dp.pm1 ?? ""}</td>
              <td>${dp.o3 ?? ""}</td>
              <td>${dp.co2 ?? ""}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `
      )
      .join("")}
  </div>
</body>
</html>
`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, filename + ".html");
};

export const exportXML = (
  sensors: AQMergedSensor[],
  metadata: AQExportMetadata,
  filename: string
) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<airQuality>
  <metadata>
    <exportDate>${metadata.exportDate}</exportDate>
    <viewMode>${metadata.viewMode}</viewMode>
    <selectedDate>${metadata.selectedDate}</selectedDate>
    ${
      metadata.timeRange
        ? `<timeRange start="${metadata.timeRange.start}" end="${metadata.timeRange.end}" />`
        : ""
    }
    <timeUnit>${metadata.timeUnit}</timeUnit>
  </metadata>
  <sensors>
    ${sensors
      .map(
        (s) => `
      <sensor id="${s.id}">
        <name>${s.name}</name>
        ${s.dataPoints
          .map(
            (dp) => `
        <measurement>
          <timestamp>${dp.timestamp}</timestamp>
          <pm25>${dp.pm25 ?? ""}</pm25>
          <pm1>${dp.pm1 ?? ""}</pm1>
          <o3>${dp.o3 ?? ""}</o3>
          <co2>${dp.co2 ?? ""}</co2>
        </measurement>
        `
          )
          .join("")}
      </sensor>`
      )
      .join("")}
  </sensors>
</airQuality>`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  triggerDownload(blob, filename + ".xml");
};

export const exportRDF = (sensors: AQMergedSensor[], filename: string) => {
  const rdf = `
@prefix aq: <http://example.org/aq#> .

${sensors
  .map(
    (s, si) => `
aq:sensor_${si} a aq:Sensor ;
  aq:id "${s.id}" ;
  aq:name "${s.name}" .

${s.dataPoints
  .map(
    (dp, di) => `
aq:measurement_${si}_${di} a aq:Measurement ;
  aq:sensor aq:sensor_${si} ;
  aq:timestamp "${dp.timestamp}" ;
  aq:pm25 "${dp.pm25 ?? ""}" ;
  aq:pm1 "${dp.pm1 ?? ""}" ;
  aq:o3 "${dp.o3 ?? ""}" ;
  aq:co2 "${dp.co2 ?? ""}" .
`
  )
  .join("")}
`
  )
  .join("")}
`;

  const blob = new Blob([rdf], { type: "text/turtle;charset=utf-8" });
  triggerDownload(blob, filename + ".ttl");
};
