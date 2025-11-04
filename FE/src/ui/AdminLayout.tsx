import { Outlet } from "react-router-dom";
import AdminSiderbar from "./AdminSiderbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex">
      <AdminSiderbar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
