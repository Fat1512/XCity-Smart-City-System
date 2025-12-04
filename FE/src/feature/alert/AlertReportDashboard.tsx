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
import { useMemo } from "react";
import {
  FaExclamationTriangle,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaChartBar,
} from "react-icons/fa";

import { Pie, Bar } from "react-chartjs-2";
import useGetAlertStatics from "./useGetAlertStatics";
import type { Alert } from "./AlertDetail";
import { mapToLabels } from "../../utils/helper";
import {
  ALERT_CATEGORIES,
  ALERT_SUB_CATEGORIES,
} from "../../utils/appConstant";
import { useSearchParams } from "react-router-dom";
import AlertDownloadSection from "./AlertDownloadSection";
import MetaCreateionAccordion from "../../ui/MetaCreateionAccordion";

const AlertReportDashboard = () => {
  const [searchParams, setSearhParams] = useSearchParams();
  const type = searchParams.get("type") || "today";
  const { isLoading, statics } = useGetAlertStatics();

  const stats = useMemo(() => {
    if (!statics || isLoading)
      return { total: 0, solved: 0, unsolved: 0, traffic: 0 };

    return {
      total: statics.total ?? 0,
      solved: statics.solved ?? 0,
      unsolved: statics.unsolved ?? 0,
      traffic: statics.categoryCounts?.traffic ?? 0,
    };
  }, [statics, isLoading]);

  const categoryData = useMemo(() => {
    if (!statics?.categoryCounts) return { labels: [], datasets: [] };

    const mapped = mapToLabels(statics.categoryCounts, ALERT_CATEGORIES);

    return {
      labels: Object.keys(mapped),
      datasets: [
        {
          data: Object.values(mapped),
          backgroundColor: [
            "#3b82f6",
            "#8b5cf6",
            "#ec4899",
            "#f59e0b",
            "#10b981",
          ],
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [statics]);

  const subCategoryData = useMemo(() => {
    if (!statics?.subCategoryCounts) return { labels: [], datasets: [] };

    const mapped = mapToLabels(statics.subCategoryCounts, ALERT_SUB_CATEGORIES);

    return {
      labels: Object.keys(mapped),
      datasets: [
        {
          label: "Số lượng",
          data: Object.values(mapped),
          backgroundColor: "#3b82f6",
          borderRadius: 8,
        },
      ],
    };
  }, [statics]);

  const statusData = {
    labels: ["Đã giải quyết", "Chưa giải quyết"],
    datasets: [
      {
        data: [stats.solved, stats.unsolved],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  const handleChangeType = (type: string) => {
    searchParams.set("type", type);
    setSearhParams(searchParams);
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Báo Cáo Cảnh Báo
            </h1>
            <p className="text-gray-600">
              Tổng quan về các cảnh báo và sự cố trong thành phố
            </p>
          </div>

          <select
            value={type}
            onChange={(e) => handleChangeType(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
      </div>
      <div className="mb-8">
        <AlertDownloadSection type={type} />
        <MetaCreateionAccordion coverageText="Cảnh báo trong phạm vi thành phố Hồ Chí Minh" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Tổng cảnh báo
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats.total}
              </h3>
            </div>
            <div className="bg-red-100 p-4 rounded-xl">
              <FaExclamationTriangle className="text-red-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Đã giải quyết
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats.solved}
              </h3>
            </div>
            <div className="bg-green-100 p-4 rounded-xl">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Chưa giải quyết
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats.unsolved}
              </h3>
            </div>
            <div className="bg-orange-100 p-4 rounded-xl">
              <FaClock className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Giao thông
              </p>
              <h3 className="text-3xl font-bold text-gray-800">
                {stats.traffic}
              </h3>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl">
              <FaCar className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Phân bố theo danh mục
          </h3>
          <div style={{ height: "300px" }}>
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Trạng thái giải quyết
          </h3>
          <div style={{ height: "300px" }}>
            <Pie data={statusData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Loại cảnh báo chi tiết
          </h3>
          <div style={{ height: "300px" }}>
            <Bar data={subCategoryData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Cảnh báo gần đây
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Thời gian
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Địa điểm
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Danh mục
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Mô tả
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {statics?.recentAlerts?.slice(0, 5).map((alert: Alert) => (
                <tr
                  key={alert.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(alert.dateCreated).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>

                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                    {alert.name}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {alert.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm text-gray-600">
                    {alert.description}
                  </td>

                  <td className="py-3 px-4">
                    {alert.solved ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <FaCheckCircle /> Đã giải quyết
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <FaClock /> Đang xử lý
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertReportDashboard;
