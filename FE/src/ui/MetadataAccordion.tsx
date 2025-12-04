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

const sectionsData = [
  { title: "Collaborators", content: "Fenwick Team" },
  {
    title: "Authors",
    content:
      "Rajnish Rakholia, Quan Le, Bang Ho, Khue Vu, Ricardo Simon (HelthyAir Dataset), OpenAQ contributors",
  },
  {
    title: "Coverage",
    content:
      "Air quality in Ho Chi Minh City (HelthyAir Dataset) and global stations (OpenAQ)",
  },
  {
    title: "DOI Citation",
    content: "HelthyAir DOI: 10.17632/pk6tzrjks8.1 | OpenAQ: N/A",
  },
  {
    title: "Provenance",
    content: (
      <div className="space-y-2">
        <p>Data sources:</p>
        <ul className="list-disc list-inside text-gray-700">
          <li>
            HelthyAir Dataset, Vietnam National University & University College
            Dublin (
            <a
              href="https://doi.org/10.17632/pk6tzrjks8.1"
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              DOI link
            </a>
            )
          </li>
          <li>
            OpenAQ – Global air quality data (
            <a
              href="https://openaq.org/"
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              openaq.org
            </a>
            )
          </li>
        </ul>
        <p className="text-sm text-gray-500">
          Attribution required for CC BY 4.0 datasets
        </p>
      </div>
    ),
  },
  {
    title: "License",
    content: (
      <div className="space-y-1 text-gray-700">
        <p>
          HelthyAir Dataset: CC BY 4.0 (Creative Commons Attribution 4.0
          International)
        </p>
        <p>OpenAQ: Open Data Commons Open Database License (ODbL)</p>
      </div>
    ),
  },
];

const MetadataAccordion = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mt-4 border rounded-lg overflow-hidden shadow-sm">
      {sectionsData.map(({ title, content }) => (
        <div key={title} className="border-b last:border-b-0">
          <button
            onClick={() => toggleSection(title)}
            className="w-full text-left px-5 py-3 font-medium flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
          >
            {title}
            <span className="text-xl font-bold">
              {openSections[title] ? "−" : "+"}
            </span>
          </button>
          <div
            className={`px-5 py-3 text-gray-700 transition-all duration-300 ${
              openSections[title]
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            {content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetadataAccordion;
