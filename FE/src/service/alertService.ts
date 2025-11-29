import type { AlertCreateRequest } from "../feature/alert/useCreateAlert";
import type { PaginationParams } from "../types/PaginationParams";
import { API } from "../utils/axiosConfig";
interface AlerOverviewParams extends PaginationParams {
  solved: string;
}
export async function createAlert(alert: AlertCreateRequest) {
  try {
    const res = await API.post(`/alert`, alert);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getAllAlert() {
  try {
    const res = await API.get(`/alerts`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getStatics(type: string) {
  try {
    const res = await API.get(`/alert/statics`, {
      params: {
        type,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDowloadContent(type: string) {
  try {
    const res = await API.get(`/alert/download`, {
      params: {
        type,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getAlertNotSolved({ page, size }: PaginationParams) {
  try {
    const params: Record<string, string | number> = { page, size };
    const res = await API.get(`/alert/solved`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getAlertOverview({
  page,
  size,
  solved,
}: AlerOverviewParams) {
  try {
    const params: Record<string, string | number | boolean> = { page, size };
    if (solved !== "all") params.solved = solved === "solved";

    const res = await API.get(`/alert-notification`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function markSolved(id: string) {
  try {
    const res = await API.put(`alert/${id}/solved`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
