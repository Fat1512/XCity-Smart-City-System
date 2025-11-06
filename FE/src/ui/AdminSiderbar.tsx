import React, { useState } from "react";
import {
  IoChevronDown,
  IoChevronForward,
  IoConstruct,
  IoCarSport,
  IoLeaf,
  IoBusiness,
  IoFlash,
} from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";

interface SubItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
}

const menuData: MenuItem[] = [
  {
    label: "Tòa nhà",
    icon: <IoBusiness className="text-blue-600" />,
    subItems: [
      { label: "Tòa nhà", path: "/admin/buildings" },
      { label: "Trung tâm thương mại", path: "/admin/mall" },
    ],
  },
  {
    label: "Giao thông",
    icon: <IoCarSport className="text-yellow-600" />,
    subItems: [
      { label: "Vị trí bến xe", path: "/admin/stations" },
      { label: "Tình trạng kẹt xe", path: "/admin/traffic" },
      { label: "Tai nạn", path: "/admin/accidents" },
    ],
  },
  {
    label: "Môi trường",
    icon: <IoLeaf className="text-green-600" />,
    subItems: [
      { label: "Nhiệt độ", path: "/admin/temperature" },
      { label: "Chất lượng không khí (AQI)", path: "/admin/aqi" },
      { label: "Tiếng ồn", path: "/admin/noise" },
    ],
  },
  {
    label: "Hạ tầng kỹ thuật đô thị",
    icon: <IoFlash className="text-red-500" />,
    subItems: [
      { label: "Cấp thoát nước", path: "/admin/water" },
      { label: "Viễn thông", path: "/admin/telecom" },
      { label: "Năng lượng", path: "/admin/energy" },
    ],
  },
  {
    label: "Dịch vụ công cộng",
    icon: <IoConstruct className="text-purple-600" />,
    subItems: [
      { label: "Công viên", path: "/admin/parks" },
      { label: "Bãi đỗ xe", path: "/admin/parking" },
      { label: "Đèn đường thông minh", path: "/admin/smart-lights" },
    ],
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (label: string) => {
    setOpenSection(openSection === label ? null : label);
  };

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
          {menuData.map((menu) => (
            <li key={menu.label}>
              <button
                onClick={() => toggleSection(menu.label)}
                className={`w-full flex justify-between items-center px-3 py-2 rounded-md font-medium transition-all duration-150 ${
                  openSection === menu.label
                    ? "bg-green-50 text-green-700"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {menu.icon}
                  <span>{menu.label}</span>
                </div>

                <div
                  className={`transform transition-transform ${
                    openSection === menu.label ? "rotate-180" : ""
                  }`}
                >
                  {openSection === menu.label ? (
                    <IoChevronDown size={16} />
                  ) : (
                    <IoChevronForward size={16} />
                  )}
                </div>
              </button>

              <ul
                className={`ml-6 border-l border-gray-200 overflow-hidden transition-all duration-300 ${
                  openSection === menu.label ? "max-h-64 mt-2" : "max-h-0"
                }`}
              >
                {menu.subItems?.map((sub) => {
                  const isActive = location.pathname === sub.path;

                  return (
                    <li
                      key={sub.label}
                      onClick={() => navigate(sub.path)}
                      className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {sub.label}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <button className="w-full bg-green-600 text-white py-2 rounded-md font-medium shadow hover:bg-green-700 transition">
          + Add asset
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
