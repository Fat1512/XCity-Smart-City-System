import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppLayout from "./ui/AppLayout";
import Home from "./page/Home";

import BuildingList from "./feature/building/client/BuildingList";

import AdminLayout from "./ui/AdminLayout";
import AdminBuildingWrapper from "./feature/building/AdminBuildingWrapper";
import AdminBuildingList from "./feature/building/AdminBuildingList";
import AirQualityRealtime from "./feature/air-quality-observed/AirQualityRealtime ";
import AirQualityAdmin from "./feature/air-quality-observed/AirQualityAdmin";
import AirQualityList from "./feature/air-quality-observed/AirQualityList";
import AirQualityAdminWrapper from "./feature/air-quality-observed/AirQualityAdminWrapper";
import { AirQualityProvider } from "./context/AirQualityContext";
import SensorWrapper from "./feature/map/SensorMapWrapper";
import FeatureSelection from "./ui/MapSelection";
import ReportSelection from "./ui/ReportSelection";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AirQualityProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/map" replace />} />

              <Route path="map" element={<FeatureSelection />} />
              <Route path="/map/infrastructure" element={<BuildingList />} />
              <Route path="/map/air" element={<SensorWrapper />} />

              <Route path="report" element={<ReportSelection />} />
              <Route path="/report/air" element={<AirQualityRealtime />} />
            </Route>

            <Route path="/home" element={<Home />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="infrastructures" element={<AdminBuildingList />} />
              <Route path="infrastructure" element={<AdminBuildingWrapper />} />
              <Route
                path="infrastructure/:buildingId"
                element={<AdminBuildingWrapper />}
              />
              <Route path="devices" element={<AirQualityList />} />
              <Route
                path="device/:deviceId"
                element={<AirQualityAdminWrapper />}
              />
              <Route path="device" element={<AirQualityAdminWrapper />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AirQualityProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
};

export default App;
