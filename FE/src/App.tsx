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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/map" replace />} />
            <Route path="/map" element={<BuildingList />} />
            <Route path="/air" element={<AirQualityRealtime />} />
          </Route>
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="buildings" element={<AdminBuildingList />} />
            <Route path="building" element={<AdminBuildingWrapper />} />
            <Route
              path="building/:buildingId"
              element={<AdminBuildingWrapper />}
            />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainer />
    </QueryClientProvider>
  );
};

export default App;
