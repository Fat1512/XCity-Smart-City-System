import { useQuery } from "@tanstack/react-query";

import { getAlCamera } from "../../service/cameraService";
import type { Address } from "../air-quality-observed/AirQualityAdmin";
export interface CameraOverviewResponse {
  id: string;
  cameraName: string;
  address: Address;
}
function useGetAllCamera() {
  const { isLoading, data: cameras } = useQuery<CameraOverviewResponse[]>({
    queryKey: ["all-camera"],
    queryFn: () => getAlCamera(),
  });

  return { isLoading, cameras };
}

export default useGetAllCamera;
