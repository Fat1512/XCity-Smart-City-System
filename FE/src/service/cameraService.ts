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
import type { CameraCreate } from "../feature/traffic-monitor/CameraAdmin";
import type { UpdateCameraConfigParams } from "../feature/traffic-monitor/useUpdarteCameraConfig";
import type { PaginationParams } from "../types/PaginationParams";
import { AI_REQUEST, API, AUTH_REQUEST } from "../utils/axiosConfig";
interface CameraParams extends PaginationParams {
  kw?: string;
}
export async function getCamera(id: string) {
  try {
    const res = await API.get(`/camera/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getAlCamera() {
  try {
    const res = await API.get(`/all-camera`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getCameras({ page, size, kw }: CameraParams) {
  try {
    const params: Record<string, string | number> = { page, size };
    if (kw) params.kw = kw;

    const res = await API.get("/cameras", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function createCamera(camera: CameraCreate) {
  try {
    const { id, dateCreated, dateModified, ...rest } = camera;
    const res = await AUTH_REQUEST.post(`/camera`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function updateCamera(camera: CameraCreate) {
  try {
    const { id, on, dateCreated, dateModified, type, ...rest } = camera;
    const res = await AUTH_REQUEST.put(`/camera/${id}`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function updateCameraConfig(
  cameraConfig: UpdateCameraConfigParams
) {
  try {
    const res = await AI_REQUEST.post(`/setup/save`, {
      ...cameraConfig,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
