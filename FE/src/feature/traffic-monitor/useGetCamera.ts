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
