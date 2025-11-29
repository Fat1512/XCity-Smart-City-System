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
import type { DeviceCreated } from "../feature/air-quality-observed/AirQualityAdmin";
import type { PaginationParams } from "../types/PaginationParams";
import { AUTH_REQUEST } from "../utils/axiosConfig";

interface DeviceParams extends PaginationParams {
  kw?: string;
}
export async function getDevice(id: string) {
  try {
    const res = await AUTH_REQUEST.get(`/device/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDevicesMap() {
  try {
    const res = await AUTH_REQUEST.get(`/devices-map`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDevices({ page, size, kw }: DeviceParams) {
  try {
    const params: Record<string, string | number> = { page, size };
    if (kw) params.kw = kw;

    const res = await AUTH_REQUEST.get("/devices", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function createDevice(device: DeviceCreated) {
  try {
    const { id, deviceState, dateCreated, dateModified, ...rest } = device;
    const res = await AUTH_REQUEST.post(`/device`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function updateDevice(device: DeviceCreated) {
  try {
    const { id, deviceState, dateCreated, dateModified, type, ...rest } =
      device;
    const res = await AUTH_REQUEST.put(`/device/${id}`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function startSensor(sensorId: string) {
  try {
    const res = await AUTH_REQUEST.post(`/device/${sensorId}/start`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function stopSensor(sensorId: string) {
  try {
    const res = await AUTH_REQUEST.post(`/device/${sensorId}/stop`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
