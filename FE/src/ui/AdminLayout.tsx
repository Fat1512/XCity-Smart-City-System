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
import { Outlet } from "react-router-dom";
import AdminSiderbar from "./AdminSiderbar";
import Avatar from "@mui/material/Avatar";
import Notification from "./Notification";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 text-gray-800 flex">
      <AdminSiderbar />

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 flex items-center justify-end px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <Notification />

            <div className="flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <Avatar
                alt="User"
                src="/avatar.png"
                className="ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-200"
                sx={{ width: 40, height: 40 }}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 text-sm">
                  Admin
                </span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
