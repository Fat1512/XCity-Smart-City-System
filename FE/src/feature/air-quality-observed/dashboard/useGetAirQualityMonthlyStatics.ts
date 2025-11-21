import { useQuery } from "@tanstack/react-query";

import {
  getDailyStatics,
  getMonthlyStatics,
} from "../../../service/airQualityObservedService";

export interface AirQualityMonthlyStatics {
  sensorId: string;
  month: string;
  year: string;
}
export interface AirQualityDailyStatics {
  sensorId: string;
  date: string;
}
interface AirQualityStatics {
  mode: "day" | "month";
  staticsStrategy: AirQualityDailyStatics | AirQualityMonthlyStatics;
}
function useGetAirQualityMonthlyStatics({
  staticsStrategy,
  mode,
}: AirQualityStatics) {
  if (mode === "month") {
    const { sensorId, year, month } = staticsStrategy;
    const { isLoading, data: statics } = useQuery({
      queryKey: ["airMonthlyStatics", sensorId, year, month],
      queryFn: async () => getMonthlyStatics({ sensorId, year, month }),
      enabled: !!sensorId && !!year && !!month,
    });

    return { isLoading, statics };
  }

  const { sensorId, date } = staticsStrategy;
  const { isLoading, data: statics } = useQuery({
    queryKey: ["airDailyStatics", sensorId, date],
    queryFn: async () => getDailyStatics({ sensorId, date }),
    enabled: !!sensorId && !!date,
  });

  return { isLoading, statics };
}

export default useGetAirQualityMonthlyStatics;
