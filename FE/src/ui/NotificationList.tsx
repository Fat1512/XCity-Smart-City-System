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
import useGetAlertOverview from "../feature/alert/useGetAlertOverview";
import { formatTimeAgo } from "../utils/helper";
import { ALERT_CATEGORIES } from "../utils/appConstant";
import type { Alert } from "../feature/alert/AlertDetail";
import PaginationStack from "./PaginationStack";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Fade,
  Zoom,
} from "@mui/material";
import useMarkSolved from "../feature/alert/useMarkSolved";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    traffic: "🚗",
    naturalDisaster: "🌊",
    weather: "🌦️",
    environment: "🌱",
    health: "🏥",
    security: "🔒",
    agriculture: "🌾",
    forestFire: "🔥",
  };
  return icons[category] || "📢";
};

const STATUS = [
  { value: "all", label: "Tất cả", icon: "📋" },
  { value: "unsolved", label: "Chưa giải quyết", icon: "⚠️" },
  { value: "solved", label: "Đã giải quyết", icon: "✅" },
];
const NotificationList = () => {
  const { isLoading, alerts, totalPages, page } = useGetAlertOverview();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { isPending, markSolved } = useMarkSolved();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serachParams, setSearchParams] = useSearchParams();
  const status = serachParams.get("status") || "all";
  console.log(status);
  const openModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };
  const handleChangeStatus = (status: "all" | "solved" | "unsolved") => {
    serachParams.set("status", status);
    setSearchParams(serachParams);
  };
  const closeModal = () => {
    setSelectedAlert(null);
    setIsModalOpen(false);
  };

  const handleSolveAlert = () => {
    if (!selectedAlert) return;
    markSolved(
      { id: selectedAlert.id },
      { onSuccess: () => toast.success("Đánh dấu thành công") }
    );
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="">
        <Fade in timeout={800}>
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
              Thông Báo Cảnh Báo
            </h1>
            <p className="text-slate-600 text-lg font-medium">
              Quản lý và theo dõi các cảnh báo quan trọng
            </p>
            <div className="mt-4 h-1 w-32 mx-auto bg-linear-to-r from-indigo-600 to-pink-600 rounded-full"></div>
          </div>
        </Fade>

        <Zoom in timeout={600}>
          <div className="flex gap-3 mb-8 justify-center flex-wrap">
            {STATUS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleChangeStatus(filter.value)}
                className={`
                  px-6 py-3 rounded-2xl font-semibold text-sm
                  transition-all duration-300 transform hover:scale-105
                  shadow-lg hover:shadow-xl
                  ${
                    status === filter.value
                      ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white scale-105"
                      : "bg-white text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </Zoom>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-purple-600 border-r-pink-600 absolute top-0 left-0"></div>
            </div>
            <p className="text-slate-600 font-semibold mt-6 text-lg">
              Đang tải thông báo...
            </p>
          </div>
        ) : alerts.length === 0 ? (
          <Fade in>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-purple-100 p-16 text-center">
              <div className="text-8xl mb-6 animate-bounce">📭</div>
              <p className="text-slate-500 text-xl font-medium">
                Không có thông báo nào
              </p>
            </div>
          </Fade>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: Alert, index) => (
              <Zoom in timeout={300 + index * 100} key={alert.id}>
                <div
                  onClick={() => openModal(alert)}
                  className={`
                    group relative bg-white/90 backdrop-blur-sm rounded-3xl 
                    shadow-lg hover:shadow-2xl border-2 
                    transition-all duration-500 overflow-hidden cursor-pointer
                    hover:-translate-y-1 hover:scale-[1.01]
                    ${
                      alert.solved
                        ? "border-emerald-200 hover:border-emerald-400"
                        : "border-amber-200 hover:border-amber-400"
                    }
                  `}
                >
                  <div
                    className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500
                    ${
                      alert.solved
                        ? "bg-linear-to-br from-emerald-50/50 to-teal-50/50"
                        : "bg-linear-to-br from-amber-50/50 to-orange-50/50"
                    }
                  `}
                  ></div>

                  <div className="relative p-6 flex items-start gap-5">
                    <div
                      className={`
                      flex-shrink-0 w-16 h-16 rounded-2xl 
                      flex items-center justify-center text-3xl
                      shadow-lg border-2 
                      transition-all duration-500 
                      group-hover:scale-110 group-hover:rotate-6
                      ${
                        alert.solved
                          ? "bg-linear-to-br from-emerald-100 to-teal-200 border-emerald-300"
                          : "bg-linear-to-br from-amber-100 to-orange-200 border-amber-300"
                      }
                    `}
                    >
                      {getCategoryIcon(alert.subCategory || alert.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-bold text-slate-800 text-xl leading-tight group-hover:text-indigo-700 transition-colors">
                          {ALERT_CATEGORIES.find(
                            (item) => item.value === alert.category
                          )?.label || alert.category}
                        </h3>
                        <span className="flex-shrink-0 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                          {formatTimeAgo(alert.dateCreated)}
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed mb-4 text-base">
                        {alert.description}
                      </p>

                      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="font-semibold text-slate-600 text-sm mr-2">
                          📍 Địa chỉ:
                        </span>
                        <span className="text-slate-700 text-sm">
                          {[
                            alert.address.streetAddress &&
                              `${alert.address.streetAddress}`,
                            alert.address.streetNr &&
                              `Số ${alert.address.streetNr}`,
                            alert.address.district,
                            alert.address.addressLocality,
                            alert.address.addressRegion,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
                          <span className="text-blue-600">🌍</span>
                          <span className="text-blue-700 text-xs font-medium">
                            {alert.location?.coordinates?.[1]?.toFixed(4)},{" "}
                            {alert.location?.coordinates?.[0]?.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                          <span className="text-purple-600">👤</span>
                          <span className="text-purple-700 text-xs font-medium">
                            {alert.name || "Ẩn danh"}
                          </span>
                        </div>
                        <Chip
                          icon={
                            <span className="text-base">
                              {alert.solved ? "✓" : "⚠"}
                            </span>
                          }
                          label={
                            alert.solved ? "Đã giải quyết" : "Chưa giải quyết"
                          }
                          size="small"
                          className={`font-bold ${
                            alert.solved
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Zoom>
            ))}
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <PaginationStack currentPage={page} totalPage={totalPages} />
        </div>
      )}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
          },
        }}
      >
        {selectedAlert && (
          <>
            <DialogTitle className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {getCategoryIcon(
                    selectedAlert.subCategory || selectedAlert.category
                  )}
                </span>
                <span className="font-bold text-xl">Chi tiết thông báo</span>
              </div>
            </DialogTitle>
            <DialogContent dividers className="p-6">
              <Box className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <Typography className="text-slate-800 leading-relaxed">
                    {selectedAlert.description}
                  </Typography>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <Typography variant="body2" className="text-blue-900">
                    <strong className="font-bold">📍 Địa chỉ:</strong>{" "}
                    {[
                      selectedAlert.address.streetAddress &&
                        `${selectedAlert.address.streetAddress}`,
                      selectedAlert.address.streetNr &&
                        `Số ${selectedAlert.address.streetNr}`,
                      selectedAlert.address.district,
                      selectedAlert.address.addressLocality,
                      selectedAlert.address.addressRegion,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <Typography variant="body2" className="text-purple-900">
                    <strong className="font-bold">🌍 Tọa độ:</strong>{" "}
                    {selectedAlert.location?.coordinates?.[1]?.toFixed(4)},{" "}
                    {selectedAlert.location?.coordinates?.[0]?.toFixed(4)}
                  </Typography>
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl">
                  <Typography variant="body2" className="text-indigo-900">
                    <strong className="font-bold">👤 Người tạo:</strong>{" "}
                    {selectedAlert.name || "Ẩn danh"}
                  </Typography>
                </div>
              </Box>
            </DialogContent>
            <DialogActions className="p-4">
              <Button
                onClick={closeModal}
                variant="outlined"
                className="rounded-xl"
              >
                Đóng
              </Button>
              {!selectedAlert.solved && (
                <Button
                  onClick={handleSolveAlert}
                  variant="contained"
                  className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl"
                >
                  ✓ Đánh dấu đã giải quyết
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default NotificationList;
