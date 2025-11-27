import type { AlertCreateRequest } from "../feature/alert/useCreateAlert";
import { API } from "../utils/axiosConfig";

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
