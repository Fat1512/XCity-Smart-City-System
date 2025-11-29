import { useEffect, useState } from "react";
import MiniSpinner from "../../ui/MiniSpinner";
import PaginationStack from "../../ui/PaginationStack";
import type { Address } from "./AdminBuilding";
import AdminBuildingItem from "./AdminBuildingItem";
import useGetBuildings from "./useGetBuildings";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { useNavigate, useSearchParams } from "react-router-dom";

export interface BuildingOverview {
  id: string;
  name?: string;
  description?: string | null;
  category?: string[] | null;
  address?: Address;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

const AdminBuildingList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoading, page, buildings = [], totalPages = 0 } = useGetBuildings();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchParams.set("kw", searchTerm);
      setSearchParams(searchParams);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    searchParams.set("size", e.target.value);
    searchParams.set("page", PAGE);
    setSearchParams(searchParams);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <MiniSpinner />
      </div>
    );
  }

  const hasBuildings = buildings.length > 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Danh sách tòa nhà
        </h2>

        <button
          onClick={() => navigate(`/admin/infrastructure/`)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer
                   text-sm px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm"
        >
          Thêm tòa nhà mới
        </button>
      </div>

      <div className="flex bg-white border border-gray-200 rounded-xl p-5 items-center gap-5 flex-wrap shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            placeholder="Tìm tên tòa nhà..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm 
                     focus:border-green-600 focus:ring-2 focus:ring-green-300/40
                     transition-all duration-200 outline-none"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            aria-label="Tìm kiếm tòa nhà"
          />
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm cursor-pointer
                   focus:border-green-600 focus:ring-2 focus:ring-green-300/40 outline-none transition-all duration-200"
          value={searchParams.get("size") || PAGE_SIZE}
          onChange={handlePageSizeChange}
          aria-label="Số lượng mỗi trang"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      </div>

      {hasBuildings ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {buildings.map((building: BuildingOverview) => (
              <AdminBuildingItem key={building.id} {...building} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PaginationStack currentPage={page} totalPage={totalPages} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500 text-lg">
          {searchTerm
            ? `Không tìm thấy tòa nhà nào với từ khóa "${searchTerm}"`
            : "Chưa có tòa nhà nào"}
        </div>
      )}
    </div>
  );
};

export default AdminBuildingList;
