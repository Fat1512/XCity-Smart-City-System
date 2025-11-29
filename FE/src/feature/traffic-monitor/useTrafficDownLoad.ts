import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getDownLoadStatics } from "../../service/trafficFlowObservedService";

export interface TrafficDownloadParams {
  refDevices: string[];
  date: string;
}
interface TrafficDownloadResponse {}

export default function useTrafficDownLoad() {
  const { isPending, mutate: downloadTraffic } = useMutation<
    TrafficDownloadResponse,
    Error,
    TrafficDownloadParams
  >({
    mutationFn: ({ refDevices, date }) =>
      getDownLoadStatics({ refDevices, date }),
  });
  return { isPending, downloadTraffic };
}
