import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppLayout from "./ui/AppLayout";
import Home from "./page/Home";
import Map from "./feature/map/Map";
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
            <Route path="/map" element={<Map />} />
          </Route>
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer />
    </QueryClientProvider>
  );
};

export default App;
