import { useQuery } from "@tanstack/react-query";

import { useParams } from "react-router-dom";

import { getCamera } from "../../service/cameraService";
import type { Address } from "../air-quality-observed/AirQualityAdmin";
export interface CameraResponse {
  id: string;
  cameraName: string;
  description: string;
  address: Address;
  dateModified: string;
  dataProvider: string;
  dateCreated: string;
  location: Location;
  cameraUsage: string;
  on: boolean;
  type?: "Camera";
}
function useGetCamera() {
  const { cameraId } = useParams();
  const { isLoading, data: camera } = useQuery<CameraResponse>({
    queryKey: ["camera", cameraId],
    queryFn: () => getCamera(cameraId!),
    enabled: !!cameraId,
  });

  return { isLoading, camera };
}

export default useGetCamera;
