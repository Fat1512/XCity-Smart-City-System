import React from "react";
import { IoCarSport, IoLeaf, IoFlash } from "react-icons/io5";
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
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 fixed top-0 bottom-0 bg-white border-r border-gray-200 p-4 flex flex-col shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center text-white font-bold shadow">
          SC
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Smart City</h1>
      </div>

      <nav className="flex-1 overflow-auto">
        <ul className="space-y-2 text-sm">
          {menuData.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
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
