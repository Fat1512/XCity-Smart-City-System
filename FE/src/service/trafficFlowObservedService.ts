import type { TrafficStaticsParams } from "../feature/traffic-monitor/useGetStaticsTraffic";
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
