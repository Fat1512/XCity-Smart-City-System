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
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Alert } from "../feature/alert/AlertDetail";
import { formatTimeAgo } from "../utils/helper";
import { ALERT_CATEGORIES } from "../utils/appConstant";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import useGetAlertNotSolved from "../feature/alert/useGetAlertNotSolved";
import { BASE_URL } from "../utils/Url";

const NotificationIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    traffic: "🚗",
    naturalDisaster: "🌊",
    weather: "🌦️",
    environment: "🌱",
    health: "🏥",
    security: "🔒",
    agriculture: "🌾",
  };
  return icons[category] || "📢";
};

const Notification = () => {
  const [open, setOpen] = useState(false);
  const [socketAlerts, setSocketAlerts] = useState<Alert[]>([]);
  const {
    isLoading,
    alerts: apiAlerts,
    totalElements,
  } = useGetAlertNotSolved();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const alerts = [...socketAlerts, ...apiAlerts];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const sock = new SockJS(`${BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("Alert Connected to WebSocket");
      client.subscribe("/topic/alerts", (message) => {
        const alert: Alert = JSON.parse(message.body);
        setSocketAlerts((prev) => [alert, ...prev]);
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const getTypeColor = (type: string) => {
    const colors = {
      warning: "bg-amber-100 border-amber-300",
      error: "bg-red-100 border-red-300",
      info: "bg-blue-100 border-blue-300",
      success: "bg-green-100 border-green-300",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 border-gray-300";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200"
        aria-label="Notifications"
      >
        <NotificationIcon />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
            {alerts.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-96 bg-white shadow-2xl rounded-2xl border border-gray-200 z-50 overflow-hidden animate-slideDown">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <h3 className="font-bold text-lg">Thông báo</h3>
            </div>

            <ul className="max-h-96 overflow-y-auto divide-y divide-gray-100">
              {alerts.map((alert: Alert) => (
                <li
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-start gap-3`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center text-xl ${getTypeColor(
                      alert.category
                    )}`}
                  >
                    {getCategoryIcon(alert.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 text-gray-800">
                      {
                        ALERT_CATEGORIES.find(
                          (item) => item.value === alert.category
                        )?.label
                      }
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                      {alert.description}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(alert.dateCreated)}
                    </span>
                  </div>
                </li>
              ))}
              {alerts.length === 0 && (
                <li className="p-4 text-center text-gray-400 text-sm">
                  Không có thông báo mới
                </li>
              )}
            </ul>

            <div className="border-t bg-gray-50">
              <button
                onClick={() => navigate("/admin/notifications")}
                className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 font-medium transition-colors duration-200 text-sm rounded-b-2xl"
              >
                Xem tất cả thông báo →
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.25s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Notification;
