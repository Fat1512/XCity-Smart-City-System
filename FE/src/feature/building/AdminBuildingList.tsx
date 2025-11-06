import { useState } from "react";
import MiniSpinner from "../../ui/MiniSpinner";
import PaginationStack from "../../ui/PaginationStack";
import type { Address } from "./AdminBuilding";
import AdminBuildingItem from "./AdminBuildingItem";
import useGetBuildings from "./useGetBuildings";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { useSearchParams } from "react-router-dom";

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

  const { isLoading, page, buildings = [], totalPages = 0 } = useGetBuildings();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    <div className="space-y-6">
      <div className="flex bg-white border border-gray-200 rounded-2xl p-5 justify-between items-center gap-4 flex-wrap">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Tìm tên tòa nhà..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm 
                   
                     transition-all duration-200 outline-none"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Tìm kiếm tòa nhà"
          />
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm  cursor-pointer"
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
              <AdminBuildingItem
                key={building.id}
                id={building.id}
                name={building.name}
                description={building.description}
                category={building.category}
                address={building.address}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <PaginationStack currentPage={page} totalPage={totalPages} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? `Không tìm thấy tòa nhà nào với từ khóa "${searchTerm}"`
              : "Chưa có tòa nhà nào"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminBuildingList;
