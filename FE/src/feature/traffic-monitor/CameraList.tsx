import { Plus, Search, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MiniSpinner from "../../ui/MiniSpinner";
import useGetCameras from "./useGetCameras";
import PaginationStack from "../../ui/PaginationStack";
import type { CameraCreate } from "./CameraAdmin";
import CameraItem from "./CameraItem";

const CameraList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { isLoading, cameras, totalPages, page } = useGetCameras();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  if (isLoading) return <MiniSpinner />;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchParams.set("kw", searchTerm);
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="min-h-screen bg-liner-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Device Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage all your IoT devices
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/camera")}
            className="flex cursor-pointer items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 
                       text-white font-semibold rounded-xl shadow-lg 
                       transition-all duration-200 active:scale-95"
          >
            <Plus size={20} />
            Add Device
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                           outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cameras.map((item: CameraCreate) => (
            <CameraItem key={item.id} camera={item} />
          ))}
        </div>

        {cameras.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No devices found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <PaginationStack currentPage={page} totalPage={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraList;
