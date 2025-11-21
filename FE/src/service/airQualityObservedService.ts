import type {
  AirQualityDailyStatics,
  AirQualityMonthlyStatics,
} from "../feature/air-quality-observed/dashboard/useGetAirQualityMonthlyStatics";
import { API } from "../utils/axiosConfig";

export async function getMonthlyStatics({
  sensorId,
  month,
  year,
}: AirQualityMonthlyStatics) {
  try {
    const res = await API.get("/air/monthly-statics", {
      params: { sensorId, month, year },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getDailyStatics({
  sensorId,
  date,
}: AirQualityDailyStatics) {
  try {
    const res = await API.get("/air/daily-statics", {
      params: { sensorId, date },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
