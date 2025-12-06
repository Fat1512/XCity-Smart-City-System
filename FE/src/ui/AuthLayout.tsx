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

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  logoUrl,
  bannerUrl,
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.25),transparent_70%)] pointer-events-none"></div>

      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(90deg,rgba(74,222,128,0.2)_1px,transparent_1px),linear-gradient(rgba(74,222,128,0.2)_1px,transparent_1px)] bg-[size:65px_65px]"></div>

      <div className="relative z-10 w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-emerald-400/20 rounded-3xl shadow-[0_25px_90px_rgba(16,185,129,0.25)] overflow-hidden flex">
        <div className="w-1/2 p-10 flex flex-col justify-center items-center bg-linear-to-b from-emerald-700/40 to-emerald-600/30 border-r border-emerald-400/20">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="City Logo"
              className="h-20 mb-6 object-contain drop-shadow-xl"
            />
          )}

          {bannerUrl && (
            <div className="rounded-2xl overflow-hidden shadow-xl mb-6 w-full">
              <img
                src={bannerUrl}
                alt="City Banner"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <h2 className="text-3xl font-semibold text-emerald-200 drop-shadow mb-3">
            Thành phố thông minh X-City
          </h2>
          <p className="text-emerald-100/80 text-center text-sm leading-relaxed max-w-sm">
            Nền tảng quản lý đô thị hiện đại — tích hợp camera, IoT, phân tích
            dữ liệu theo thời gian thực, hỗ trợ vận hành thông minh.
          </p>
        </div>

        <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
