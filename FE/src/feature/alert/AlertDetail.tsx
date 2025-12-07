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
import React from "react";
import { X, MapPin, Calendar, Tag, AlertTriangle } from "lucide-react";
import {
  ALERT_CATEGORIES,
  ALERT_SUB_CATEGORIES,
} from "../../utils/appConstant";
import type { Address } from "../air-quality-observed/AirQualityAdmin";
import { formatTime } from "../../utils/helper";

interface Location {
  coordinates: [number, number];
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  category: string;
  dateCreated: number;
  subCategory: string;
  address: Address;
  location: Location;
  dateIssued: number | number[];
  solved: boolean;
}

interface AlertDetailProps {
  selectedAlert: Alert | null;
  onClose: () => void;
}

const AlertDetail: React.FC<AlertDetailProps> = ({
  selectedAlert,
  onClose,
}) => {
  if (!selectedAlert) return null;

  return (
    <div className="w-[350px] top-8 absolute z-20 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-linear-to-r from-red-500 to-red-600 px-4 py-3 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-black"
        >
          <X cursor="pointer" size={18} />
        </button>
        <div className="flex items-center gap-2 pr-10">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white leading-tight">
              {selectedAlert.name}
            </h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
        {selectedAlert.description && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedAlert.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md mt-0.5">
                <Tag size={14} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Danh mục</p>
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {
                    ALERT_CATEGORIES.find(
                      (c) => c.value === selectedAlert.category
                    )?.label
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-purple-100 rounded-md mt-0.5">
                <Tag size={14} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Loại</p>
                <p className="text-sm text-gray-900 font-semibold truncate">
                  {
                    ALERT_SUB_CATEGORIES.find(
                      (c) => c.value === selectedAlert.subCategory
                    )?.label
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md">
              <Calendar size={14} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-0.5">Thời gian</p>
              <p className="text-sm text-gray-900 font-semibold">
                {formatTime(selectedAlert.dateIssued)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
          <div className="flex items-start gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm mt-0.5">
              <MapPin size={14} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-xs text-gray-500 font-medium">Địa chỉ</p>
              {selectedAlert.address.streetAddress && (
                <p className="text-xs text-gray-700">
                  Đường: {selectedAlert.address.streetAddress}
                </p>
              )}
              {selectedAlert.address.streetNr && (
                <p className="text-xs text-gray-700">
                  Số nhà: {selectedAlert.address.streetNr}
                </p>
              )}
              {selectedAlert.address.district && (
                <p className="text-xs text-gray-700">
                  Quận/Huyện: {selectedAlert.address.district}
                </p>
              )}
              {selectedAlert.address.addressLocality && (
                <p className="text-xs text-gray-700">
                  Phường/Xã: {selectedAlert.address.addressLocality}
                </p>
              )}
              {selectedAlert.address.addressRegion && (
                <p className="text-xs text-gray-700">
                  Tỉnh/Thành phố: {selectedAlert.address.addressRegion}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1 font-mono">
                {selectedAlert.location.coordinates[1].toFixed(6)},{" "}
                {selectedAlert.location.coordinates[0].toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default AlertDetail;
