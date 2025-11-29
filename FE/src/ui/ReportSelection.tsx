import React from "react";
import {
  FaCar,
  FaSmog,
  FaBuilding,
  FaChartBar,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const reports = [
  {
    id: "traffic",
    title: "Báo cáo Giao thông",
    description:
      "Phân tích tình hình giao thông và tắc nghẽn theo thời gian thực",
    icon: <FaCar size={40} />,
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    bgGlow: "group-hover:shadow-blue-500/50",
    path: "traffic",
  },
  {
    id: "air",
    title: "Báo cáo Không khí",
    description: "Đánh giá chất lượng không khí và mức độ ô nhiễm",
    icon: <FaSmog size={40} />,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    bgGlow: "group-hover:shadow-emerald-500/50",
    path: "air",
  },
  {
    id: "alert",
    title: "Báo cáo Cảnh báo",
    description: "Theo dõi và quản lý các cảnh báo khẩn cấp",
    icon: <FaExclamationTriangle size={40} />,
    gradient: "from-red-500 via-rose-600 to-pink-700",
    bgGlow: "group-hover:shadow-red-500/50",
    path: "alert",
  },
  {
    id: "infrastructure",
    title: "Báo cáo Hạ tầng",
    description: "Tổng quan về cơ sở hạ tầng và tiện ích công cộng",
    icon: <FaBuilding size={40} />,
    gradient: "from-amber-500 via-orange-600 to-red-700",
    bgGlow: "group-hover:shadow-amber-500/50",
    path: "infrastructure",
  },
];

const ReportSelection: React.FC = () => {
  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    navigate(`/report/${path}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto mb-16 text-center relative z-10">
        <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
          Báo Cáo Thông Minh
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Chọn loại báo cáo để xem phân tích chi tiết và thông tin tức thời về
          thành phố của bạn
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {reports.map((report, index) => (
          <div
            key={report.id}
            onClick={() => handleNavigate(report.path)}
            className="group relative cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${report.gradient} rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500 ${report.bgGlow}`}
            ></div>

            {/* Card Container */}
            <div className="relative h-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3">
              {/* Gradient Overlay on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Animated Particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-200"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
              </div>

              {/* Content */}
              <div className="relative p-8 flex flex-col items-center text-center h-full">
                {/* Icon Container */}
                <div
                  className={`mb-6 p-6 rounded-2xl bg-gradient-to-br ${report.gradient} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <div className="text-white filter drop-shadow-lg">
                    {report.icon}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-white transition-colors duration-500">
                  {report.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 group-hover:text-white/95 transition-colors duration-500 mb-6 flex-grow text-sm leading-relaxed">
                  {report.description}
                </p>

                {/* Button */}
                <div className="relative w-full">
                  <button className="w-full px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-800 group-hover:bg-white group-hover:text-gray-800 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-lg hover:shadow-xl">
                    Xem chi tiết →
                  </button>
                </div>
              </div>

              {/* Corner Shine Effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/30 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top Border Accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${report.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ReportSelection;
