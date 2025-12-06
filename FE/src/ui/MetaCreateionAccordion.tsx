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
                {content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetaCreateionAccordion;
