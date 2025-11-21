import React from "react";
import { FaCar, FaSmog, FaBuilding, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const reports = [
  {
    id: "traffic",
    title: "Báo cáo Giao thông",
    description: "Phân tích tình hình giao thông và tắc nghẽn",
    icon: <FaCar size={40} />,
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    color: "blue",
    path: "traffic",
  },
  {
    id: "air",
    title: "Báo cáo Không khí",
    description: "Đánh giá chất lượng không khí và ô nhiễm",
    icon: <FaSmog size={40} />,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    color: "green",
    path: "air",
  },
  {
    id: "infrastructure",
    title: "Báo cáo Hạ tầng",
    description: "Tổng quan về cơ sở hạ tầng và tiện ích",
    icon: <FaBuilding size={40} />,
    gradient: "from-amber-500 via-orange-600 to-red-700",
    color: "orange",
    path: "infrastructure",
  },
];

const ReportSelection: React.FC = () => {
  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    navigate(`/report/${path}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <FaChartBar className="text-blue-600" size={50} />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Báo Cáo Thông Minh
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Chọn loại báo cáo để xem phân tích chi tiết về thành phố của bạn
        </p>
      </div>

      {/* Reports Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => handleNavigate(report.path)}
            className="group relative cursor-pointer"
          >
            {/* Card Container */}
            <div className="relative h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${report.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Pattern Background */}
              <div className="absolute inset-0 opacity-5">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <pattern
                    id={`pattern-${report.id}`}
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="1.5"
                      fill="currentColor"
                      className={`text-${report.color}-500`}
                    />
                    <path
                      d="M5 10 L10 5 L15 10 L10 15 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className={`text-${report.color}-400`}
                    />
                  </pattern>
                  <rect
                    width="100"
                    height="100"
                    fill={`url(#pattern-${report.id})`}
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="relative p-8 flex flex-col items-center text-center h-full">
                {/* Icon Container */}
                <div
                  className={`mb-6 p-6 rounded-2xl bg-linear-to-br ${report.gradient} shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <div className="text-white">{report.icon}</div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-white transition-colors duration-500">
                  {report.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-500 mb-6 flex-grow">
                  {report.description}
                </p>

                {/* Button */}
                <button
                  className={`px-6 py-3 rounded-xl font-semibold bg-linear-to-r ${report.gradient} text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:shadow-xl`}
                >
                  Xem báo cáo
                </button>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-white/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-white/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportSelection;
