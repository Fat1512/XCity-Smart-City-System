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
import type React from "react";
import type { BuildingOverview } from "./AdminBuildingList";
import { IoSettingsSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const AdminBuildingItem: React.FC<BuildingOverview> = ({
  id,
  name,
  description,
  address,
  category,
}) => {
  const hasAddress =
    address &&
    (address.streetAddress ||
      address.streetNr ||
      address.district ||
      address.addressLocality ||
      address.addressRegion ||
      address.postalCode ||
      address.addressCountry);
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-green-600 text-white w-11 h-11 flex items-center justify-center rounded-xl text-lg font-semibold shadow-sm">
          {name?.charAt(0).toUpperCase() ?? "B"}
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          {name || "Không tên"}
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {description || "Không có mô tả"}
      </p>

      <div className="text-sm text-gray-700 mb-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
        <p className="font-semibold mb-1">📍 Địa chỉ</p>

        {hasAddress ? (
          <div className="space-y-1 text-gray-600">
            {address.streetAddress && (
              <p>
                - Đường: {address.streetAddress}
                {address.streetNr ? `, Số ${address.streetNr}` : ""}
              </p>
            )}
            {address.district && <p>- Quận/Huyện: {address.district}</p>}
            {address.addressLocality && (
              <p>- Thành phố: {address.addressLocality}</p>
            )}
            {address.addressRegion && <p>- Vùng: {address.addressRegion}</p>}
            {address.postalCode && <p>- Mã bưu điện: {address.postalCode}</p>}
            {address.addressCountry && (
              <p>- Quốc gia: {address.addressCountry}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 italic">Không rõ địa chỉ</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {category?.length ? (
          category.map((item) => (
            <span
              key={item}
              className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-300"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400 italic">
            Không có danh mục
          </span>
        )}
      </div>

      <button
        onClick={() => navigate(`/admin/infrastructure/${id}`)}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-lg font-medium transition-all duration-300 shadow-sm"
      >
        <IoSettingsSharp size={16} />
        Quản lý tòa nhà
      </button>
    </div>
  );
};

export default AdminBuildingItem;
