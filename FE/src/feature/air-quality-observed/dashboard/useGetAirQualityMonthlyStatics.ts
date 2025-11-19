import { useQuery } from "@tanstack/react-query";

import { getMonthlyStatics } from "../../../service/airQualityObservedService";

export interface AirQualityMonthlyStatics {
  sensorId: string;
  month: string;
  year: string;
}
function useGetAirQualityMonthlyStatics({
  sensorId,
  year,
  month,
}: AirQualityMonthlyStatics) {
  const { isLoading, data: statics } = useQuery({
    queryKey: ["airMonthlyStatics", sensorId, year, month],
    queryFn: async () => getMonthlyStatics({ sensorId, year, month }),
    enabled: !!sensorId && !!year && !!month,
  });

  return { isLoading, statics };
}

export default useGetAirQualityMonthlyStatics;
