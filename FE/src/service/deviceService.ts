import type { DeviceCreated } from "../feature/air-quality-observed/AirQualityAdmin";
import type { PaginationParams } from "../types/PaginationParams";
import { API, SENSOR_API } from "../utils/axiosConfig";

// export async function updateBuilding(building: Building) {
//   try {
//     const { id, dateCreated, dateModified, ...rest } = building;
//     const res = await API.put(`/building/${id}`, { ...rest });
//     return res.data;
//   } catch (error: any) {
//     throw new Error(
//       error.response?.data?.message || error.message || "Unknown error"
//     );
//   }
// }
interface DeviceParams extends PaginationParams {
  kw?: string;
}
export async function getDevice(id: string) {
  try {
    const res = await API.get(`/device/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDevicesMap() {
  try {
    const res = await API.get(`/devices-map`);
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

    const res = await API.get("/devices", {
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
    const res = await API.post(`/device`, { ...rest });
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
    const res = await API.put(`/device/${id}`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function startSensor(sensorId: string) {
  try {
    const res = await API.post(`/device/${sensorId}/start`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function stopSensor(sensorId: string) {
  try {
    const res = await API.post(`/device/${sensorId}/stop`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
