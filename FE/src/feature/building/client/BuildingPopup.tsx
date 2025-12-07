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
import React, { useEffect } from "react";

interface Address {
  streetAddress?: string;
  streetNr?: string;
  district?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
}

interface BuildingPopupProps {
  id: string;
  name: string;
  description?: string;
  address?: Address;
  coordinates: [number, number];
  onClose: () => void;
}

const BuildingPopup: React.FC<BuildingPopupProps> = ({
  id,
  name,
  description,
  address,
  coordinates,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const fullAddress = [
    address?.streetAddress,
    address?.streetNr,
    address?.district,
    address?.addressLocality,
    address?.addressRegion,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="absolute top-0 left-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => e.currentTarget === e.target && onClose()}
      role="dialog"
      aria-labelledby="popup-title"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-3xl max-w-lg w-full transform transition-all animate-zoomIn">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2
            id="popup-title"
            className="text-3xl font-extrabold text-gray-800 pr-4"
          >
            {name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-all p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Close popup"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {description && (
            <div className="text-gray-600 leading-relaxed border-l-4 border-blue-400 pl-3 bg-blue-50/50 p-2 rounded">
              {description}
            </div>
          )}

          {address && fullAddress && (
            <div className="flex items-start space-x-4 text-gray-700">
              <svg
                className="w-6 h-6 mt-0.5 shrink-0 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </span>
                <span className="flex-1 text-base">{fullAddress}</span>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-4 text-gray-700">
            <svg
              className="w-6 h-6 mt-0.5 shrink-0 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
                Tọa độ
              </span>
              <span className="flex-1 font-mono text-base">
                Lat: **{coordinates[1].toFixed(5)}**, Lng: **
                {coordinates[0].toFixed(5)}**
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <span className="text-xs font-medium text-gray-400">
            Building ID: <span className="font-mono text-gray-600">{id}</span>
          </span>
        </div>
      </div>

      <style>{`
        /* Custom Shadow for modern look */
        .shadow-3xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smoother transition */
        }
      `}</style>
    </div>
  );
};

export default BuildingPopup;
