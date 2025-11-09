import type { Building } from "../feature/building/AdminBuilding";
import type { PaginationParams } from "../types/PaginationParams";
import { API } from "../utils/axiosConfig";
interface BuildingsParams extends PaginationParams {
  kw?: string;
}

export async function getBuildings() {
  try {
    const res = await API.get("/buildings");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getBuilding(id: string) {
  try {
    const res = await API.get(`/building/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getSBuildings({ page, size, kw }: BuildingsParams) {
  try {
    const params: Record<string, string | number> = { page, size };
    if (kw) params.kw = kw;

    const res = await API.get("/s-buildings", {
      params,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function updateBuilding(building: Building) {
  try {
    const { id, dateCreated, dateModified, ...rest } = building;
    const res = await API.put(`/building/${id}`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function createBuilding(building: Building) {
  try {
    const { id, dateCreated, dateModified, ...rest } = building;
    const res = await API.put(`/building`, { ...rest });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
