import React from "react";
import { FaCar, FaSmog, FaBuilding, FaMapMarkedAlt } from "react-icons/fa";
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <FaMapMarkedAlt className="text-blue-600" size={50} />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Khám phá Bản đồ Thông minh
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Chọn loại bản đồ để xem thông tin chi tiết về thành phố của bạn
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => handleNavigate(feature.path)}
            className="group relative cursor-pointer"
          >
            {/* Card Container */}
            <div className="relative h-full bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2">
              {/* Gradient Background with Map Pattern */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Map Pattern Background */}
              <div className="absolute inset-0 opacity-5">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <pattern
                    id={`pattern-${feature.id}`}
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
                      className={`text-${feature.color}-500`}
                    />
                    <path
                      d="M10 5 L15 10 L10 15 L5 10 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className={`text-${feature.color}-400`}
                    />
                  </pattern>
                  <rect
                    width="100"
                    height="100"
                    fill={`url(#pattern-${feature.id})`}
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="relative p-8 flex flex-col items-center text-center h-full">
                {/* Icon Container */}
                <div
                  className={`mb-6 p-6 rounded-2xl bg-linear-to-br ${feature.gradient} shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <div className="text-white">{feature.icon}</div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-white transition-colors duration-500">
                  {feature.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-500 mb-6 flex-grow">
                  {feature.description}
                </p>

                {/* Button */}
                <button
                  className={`px-6 py-3 rounded-xl font-semibold bg-linear-to-r ${feature.gradient} text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:shadow-xl`}
                >
                  Xem bản đồ
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

export default FeatureSelection;
