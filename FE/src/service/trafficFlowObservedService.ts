import type { TrafficStaticsParams } from "../feature/traffic-monitor/useGetStaticsTraffic";
import type { TrafficDownloadParams } from "../feature/traffic-monitor/useTrafficDownLoad";
import { API } from "../utils/axiosConfig";

export async function getTrafficDailyStatics({
  cameraId,
  date,
}: TrafficStaticsParams) {
  try {
    const res = await API.get(`/traffic/daily-statics/${cameraId}`, {
      params: { date },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getDownLoadStatics({
  refDevices,
  date,
}: TrafficDownloadParams) {
  try {
    const res = await API.post(`/traffic/download-statics/`, {
      refDevices,
      date,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
