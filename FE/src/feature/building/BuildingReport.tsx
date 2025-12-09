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
import License from "../../ui/License";

import BuildingDownloadSection from "./BuildingDownloadSection";
const MetaCreateionAccordion = ({}) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const defaultCoverage = `
Bộ dữ liệu tập hợp vị trí và thông tin của các trụ sở Công an, Bệnh viện và Ủy ban Nhân dân tại TP.HCM. 
Dữ liệu bao gồm tên, địa chỉ, danh mục, tọa độ và thời gian cập nhật của từng cơ sở. 
Nguồn được tổng hợp từ nhóm phát triển và dữ liệu OpenStreetMap (Nominatim / Overpass API).
`.trim();

  const sectionsData = [
    { title: "Collaborators", content: "Fenwick Team" },
    { title: "Authors", content: "Team Fenwick" },
    { title: "Coverage", content: defaultCoverage },
    { title: "DOI Citation", content: "N/A" },
    {
      title: "Provenance",
      content: (
        <div className="space-y-2">
          <p>
            **Dữ liệu chính** được thu thập từ{" "}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              OpenStreetMap (OSM)
            </a>{" "}
            thông qua Nominatim / Overpass API.
          </p>
          <p className="text-sm text-gray-500">
            *Lưu ý: Bạn phải luôn tuân thủ giấy phép ODbL của dữ liệu nguồn.*
          </p>
        </div>
      ),
    },
    { title: "License", content: <License /> },
  ];

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        {sectionsData.map(({ title, content }, index) => (
          <div
            key={title}
            className={index !== 0 ? "border-t border-gray-100" : ""}
          >
            <button
              onClick={() => toggleSection(title)}
              className="w-full cursor-pointer text-left px-6 py-4 font-semibold text-gray-800 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="text-base">{title}</span>
              <span className="text-2xl text-gray-400 font-light">
                {openSections[title] ? "−" : "+"}
              </span>
            </button>

            {openSections[title] && (
              <div className="px-6 py-4 bg-gray-50 text-gray-700 text-sm leading-relaxed border-t border-gray-100">
                {typeof content === "string" ? content : content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
const BuildingReport = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Dữ liệu các trụ sở hành chính trong thành phố Hồ Chí Minh
            </h1>
            <p className="text-gray-600"></p>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <BuildingDownloadSection />
        <MetaCreateionAccordion />
      </div>
    </div>
  );
};

export default BuildingReport;
