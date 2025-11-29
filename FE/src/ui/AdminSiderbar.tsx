import React from "react";
import { IoCarSport, IoLeaf, IoFlash } from "react-icons/io5";
import { MdOutlineSos } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

interface SimpleMenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuData: SimpleMenuItem[] = [
  {
    label: "Giao thông",
    icon: <IoCarSport className="text-yellow-600" />,
    path: "/admin/traffic",
  },
  {
    label: "Thiết bị",
    icon: <IoLeaf className="text-green-600" />,
    path: "/admin/devices",
  },
  {
    label: "Hạ tầng",
    icon: <IoFlash className="text-red-500" />,
    path: "/admin/infrastructures",
  },
  {
    label: "Cứu hộ",
    icon: <MdOutlineSos className="text-red-500" />,
    path: "/admin/alert",
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 fixed top-0 bottom-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-105 transition-transform duration-200">
            SC
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Smart City
            </h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-auto p-4">
        <ul className="space-y-1">
          {menuData.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group relative ${
                    isActive
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-r-full" />
                  )}

                  {/* Icon with scale effect */}
                  <div
                    className={`text-xl transform transition-transform duration-200 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span className="flex-1 text-left">{item.label}</span>

                  {/* Arrow indicator for active item */}
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
