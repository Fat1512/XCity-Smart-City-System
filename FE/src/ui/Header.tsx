import {
  FaHome,
  FaMapMarkedAlt,
  FaChartBar,
  FaCog,
  FaInfoCircle,
} from "react-icons/fa";
const Header = () => {
  return (
    <header className="p-4 border-b bg-white/70 backdrop-blur-md flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md">
          <span className="text-white font-bold text-sm">SC</span>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          SmartCity
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        {[
          { name: "Trang chủ", icon: <FaHome size={18} /> },
          { name: "Bản đồ", icon: <FaMapMarkedAlt size={18} /> },
          { name: "Báo cáo", icon: <FaChartBar size={18} /> },
          { name: "Cài đặt", icon: <FaCog size={18} /> },
          { name: "Giới thiệu", icon: <FaInfoCircle size={18} /> },
        ].map((item) => (
          <a
            key={item.name}
            href="#"
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-all duration-200 group"
          >
            {item.icon}
            <span className="text-sm font-medium group-hover:underline underline-offset-4">
              {item.name}
            </span>
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Header;
