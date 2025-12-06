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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppLayout from "./ui/AppLayout";
import Home from "./page/Home";
import LoginPage from "./page/LoginPage";

import BuildingList from "./feature/building/client/BuildingList";

import AdminLayout from "./ui/AdminLayout";
import AdminBuildingWrapper from "./feature/building/AdminBuildingWrapper";
import AdminBuildingList from "./feature/building/AdminBuildingList";
import AirQualityList from "./feature/air-quality-observed/AirQualityList";
import AirQualityAdminWrapper from "./feature/air-quality-observed/AirQualityAdminWrapper";
import { AirQualityProvider } from "./context/AirQualityContext";

import FeatureSelection from "./ui/FeatureSelection";
import ReportSelection from "./ui/ReportSelection";

import CameraWrapper from "./feature/traffic-monitor/CameraWrapper";
import CameraList from "./feature/traffic-monitor/CameraList";

import { TrafficMonitorContextProvider } from "./context/TrafficMonitorContext";

import AlertAdmin from "./feature/alert/AlertAdmin";
import NotificationList from "./ui/NotificationList";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ProtectedRoute from "./ui/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import RouterPicker from "./feature/map/RouterPicker";
import TrafficMonitorPage from "./page/TrafficMonitorPage";
import TrafficStaticsPage from "./page/TrafficStaticsPage";
import AlertPage from "./page/AlertPage";
import AlertReportPage from "./page/AlertReportPage";
import AirQualityPage from "./page/AirQualityPage";
import AirQualityReportPage from "./page/AirQualityReportPage";
import AdminPage from "./page/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AirQualityProvider>
          <TrafficMonitorContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="map" element={<FeatureSelection />} />
                  <Route
                    path="/map/infrastructure"
                    element={<BuildingList />}
                  />
                  <Route path="/map/air" element={<AirQualityPage />} />
                  <Route path="/map/router" element={<RouterPicker />} />
                  <Route path="/map/traffic" element={<TrafficMonitorPage />} />
                  <Route path="/map/alert" element={<AlertPage />} />

                  <Route path="report" element={<ReportSelection />} />
                  <Route
                    path="/report/air"
                    element={<AirQualityReportPage />}
                  />
                  <Route path="/report/alert" element={<AlertReportPage />} />
                  <Route
                    path="/report/traffic"
                    element={<TrafficStaticsPage />}
                  />
                </Route>

                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<Home />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="chatbot" element={<AdminPage />} />
                  <Route path="alert" element={<AlertAdmin />} />
                  <Route path="notifications" element={<NotificationList />} />
                  <Route
                    path="infrastructures"
                    element={<AdminBuildingList />}
                  />
                  <Route
                    path="infrastructure"
                    element={<AdminBuildingWrapper />}
                  />
                  <Route
                    path="infrastructure/:buildingId"
                    element={<AdminBuildingWrapper />}
                  />
                  <Route path="devices" element={<AirQualityList />} />\
                  <Route
                    path="device/:deviceId"
                    element={<AirQualityAdminWrapper />}
                  />
                  <Route path="device" element={<AirQualityAdminWrapper />} />
                  <Route path="traffic" element={<CameraList />} />
                  <Route path="camera" element={<CameraWrapper />} />
                  <Route path="camera/:cameraId" element={<CameraWrapper />} />
                </Route>
                <Route path="*" element={<Home />} />
              </Routes>
            </BrowserRouter>
          </TrafficMonitorContextProvider>
        </AirQualityProvider>
        <ToastContainer />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
