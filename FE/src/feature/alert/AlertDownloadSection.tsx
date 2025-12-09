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
import useDownLoadAlert from "./useDownLoadAlert";
import type { Alert } from "./AlertDetail";
interface AlertDownloadSectionProps {
  type: string;
}
const AlertDownloadSection = ({ type }: AlertDownloadSectionProps) => {
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const { isPending, download } = useDownLoadAlert();
  const downloadAsJSON = () => {
    download(
      { type },
      {
        onSuccess: (data) => {
          const content = JSON.stringify(data || [], null, 2);
          downloadFile(content, "alert.json", "application/json;charset=utf-8");
        },
      }
    );
  };
  const downloadAsHTML = () => {
    download(
      { type },
      {
        onSuccess: (data) => {
          const list = data || [];
          const htmlRows = list
            .map(
              (item: Alert) => `
            <tr>
              <td>${item.id ?? ""}</td>
              <td>Alert</td>
              <td>${item.name ?? ""}</td>
              <td>${item.category ?? ""}</td>
              <td>${item.subCategory ?? ""}</td>
              <td>${item.address?.addressLocality ?? ""}</td>
              <td>${item.address?.addressRegion ?? ""}</td>
              <td>${item.address?.streetAddress ?? ""}</td>
              <td>${item.location?.type ?? ""}</td>
              <td>${item.location?.coordinates?.[0] ?? ""}</td>
              <td>${item.location?.coordinates?.[1] ?? ""}</td>
              <td>${item.dateIssued ?? ""}</td>
              <td>${item.description ?? ""}</td>
            </tr>`
            )
            .join("");

          const htmlContent = `
          <table border="1">
            <thead>
              <tr>
                <th>id_</th>
                <th>type_</th>
                <th>name_</th>
                <th>category_</th>
                <th>subCategory_</th>
                <th>address_addressLocality_</th>
                <th>address_addressRegion_</th>
                <th>address_streetAddress_</th>
                <th>location__type_</th>
                <th>location__coordinates__0_</th>
                <th>location__coordinates__1_</th>
                <th>dateIssued_</th>
                <th>description_</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
        `;

          downloadFile(htmlContent, "alert.html", "text/html;charset=utf-8");
        },
      }
    );
  };
  const downloadAsCSV = () => {
    const headers = [
      "id_",
      "type_",
      "name_",
      "category_",
      "subCategory_",
      "address_addressLocality_",
      "address_addressRegion_",
      "address_streetAddress_",
      "location__type_",
      "location__coordinates__0_",
      "location__coordinates__1_",
      "dateIssued_",
      "description_",
    ];

    const rows: string[] = [headers.join(",")];

    download(
      { type },
      {
        onSuccess: (data) => {
          const list = data || [];

          list.forEach((item: Alert) => {
            const row = [
              item.id,
              "Alert",
              item.name,
              item.category,
              item.subCategory,
              item.address.addressLocality,
              item.address.addressRegion,
              `"${item.address.streetAddress}"`,
              item.location.type,
              item.location.coordinates[0],
              item.location.coordinates[1],
              item.dateIssued,
              `"${item.description}"`,
            ].join(",");

            rows.push(row);
          });
          downloadFile(rows.join("\n"), `alert.csv`, "text/csv");
        },
      }
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
      //     break;
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
      </p>
    </div>
  );
};
export default AlertDownloadSection;
