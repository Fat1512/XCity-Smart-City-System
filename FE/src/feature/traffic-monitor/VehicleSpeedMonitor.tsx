import { useState } from "react";
import StreamPanel from "./StreamPanel";
import useGetCameras from "./useGetCameras";
import MiniSpinner from "../../ui/MiniSpinner";
import type { CameraResponse } from "./useGetCamera";
import PaginationStack from "../../ui/PaginationStack";

export default function VehicleSpeedMonitor() {
  const { isLoading, cameras, totalPages, page, totalElements } =
    useGetCameras();

  if (isLoading) return <MiniSpinner />;

  return (
    <div className="px-6 py-10 bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
          🚦 Vehicle Speed Monitor
        </h1>
        <p className="text-gray-600 text-lg">
          Monitor live vehicle speed from multiple cameras in real-time
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera: CameraResponse) => (
          <StreamPanel key={camera.id} camera={camera} />
        ))}
      </div>

      {totalElements === 0 && (
        <div className="text-center text-gray-400 mt-12">
          Chưa có stream nào. Hãy thêm một stream ID phía trên.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <PaginationStack currentPage={page} totalPage={totalPages} />
        </div>
      )}
    </div>
  );
}
