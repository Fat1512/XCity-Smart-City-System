import { useQuery } from "@tanstack/react-query";
import { getTrafficDailyStatics } from "../../service/trafficFlowObservedService";

export interface TrafficStaticsParams {
  cameraId: string | null;
  date: string;
}

function useGetStaticsTraffic({ cameraId, date }: TrafficStaticsParams) {
  const { isLoading, data: statics } = useQuery({
    queryKey: ["trafficStatics", cameraId, date],
    queryFn: () => getTrafficDailyStatics({ cameraId, date }),
    enabled: !!cameraId,
  });

  return { isLoading, statics };
}

export default useGetStaticsTraffic;
