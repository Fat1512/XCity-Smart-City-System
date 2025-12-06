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
import {
  FaCar,
  FaSmog,
  FaBuilding,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const features = [
  {
    id: "traffic",
    title: "Giao thông",
    description: "Xem thông tin giao thông thời gian thực",
    icon: <FaCar size={40} />,
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    color: "blue",
    mapPattern: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    path: "traffic",
  },
  {
    id: "air",
    title: "Chất lượng không khí",
    description: "Theo dõi chỉ số AQI và ô nhiễm",
    icon: <FaSmog size={40} />,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    color: "green",
    mapPattern:
      "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    path: "air",
  },
  {
    id: "alert",
    title: "Cảnh báo",
    description: "Tạo các cảnh báo khẩn cấp",
    icon: <FaExclamationTriangle size={40} />,
    gradient: "from-red-500 via-rose-600 to-pink-700",
    bgGlow: "group-hover:shadow-red-500/50",
    path: "alert",
  },
  {
    id: "infrastructure",
    title: "Cơ sở hạ tầng",
    description: "Khám phá các công trình và tiện ích",
    icon: <FaBuilding size={40} />,
    gradient: "from-amber-500 via-orange-600 to-red-700",
    color: "orange",
    mapPattern:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    path: "infrastructure",
  },
];

const FeatureSelection: React.FC = () => {
  const navgiate = useNavigate();
  const handleNavigate = (path: string) => {
    navgiate(`/map/${path}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto mb-16 text-center relative z-10">
        <h1 className="text-5xl font-extrabold mb-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Khám phá Bản đồ Thông minh
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Chọn loại bản đồ để xem thông tin chi tiết về thành phố của bạn
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            onClick={() => handleNavigate(feature.path)}
            className="group relative cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`absolute -inset-1 bg-linear-to-r ${feature.gradient} rounded-3xl blur opacity-0 group-hover:opacity-75 transition duration-500 ${feature.bgGlow}`}
            ></div>

            <div className="relative h-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3">
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-200"></div>
                <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
              </div>

              <div className="relative p-8 flex flex-col items-center text-center h-full">
                <div
                  className={`mb-6 p-6 rounded-2xl bg-linear-to-br ${feature.gradient} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                >
                  <div className="text-white filter drop-shadow-lg">
                    {feature.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-white transition-colors duration-500">
                  {feature.title}
                </h2>

                <p className="text-gray-600 group-hover:text-white/95 transition-colors duration-500 mb-6 grow text-sm leading-relaxed">
                  {feature.description}
                </p>

                <div className="relative w-full">
                  <button className="w-full px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-800 group-hover:bg-white group-hover:text-gray-800 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-lg hover:shadow-xl">
                    Xem chi tiết →
                  </button>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-white/30 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${feature.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              ></div>
            </div>
          </div>
        ))}
      </div>

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

export default FeatureSelection;
