import type { CameraCreate } from "../feature/traffic-monitor/CameraAdmin";
import type { PaginationParams } from "../types/PaginationParams";
import { API } from "../utils/axiosConfig";
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
    const res = await API.post(`/camera`, { ...rest });
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
    const res = await API.put(`/camera/${id}`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
