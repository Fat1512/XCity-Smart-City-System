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
import License from "./License";

interface MetaCreateionAccordionProps {
  coverageText: string;
}

const MetaCreateionAccordion = ({
  coverageText,
}: MetaCreateionAccordionProps) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionsData = [
    { title: "Collaborators", content: "Fenwick Team" },
    { title: "Authors", content: "Team Fenwick" },
    {
      title: "Coverage",
      content: coverageText,
    },
    { title: "DOI Citation", content: "N/A" },
    {
      title: "Provenance",
      content: (
        <div className="space-y-1">
          <p>Dataset created and maintained by Fenwick Team.</p>
          <p className="text-sm text-gray-500">
            Data collected from our camera in HCMC.
          </p>
        </div>
      ),
    },
    { title: "License", content: <License /> },
  ];

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

export default MetaCreateionAccordion;
