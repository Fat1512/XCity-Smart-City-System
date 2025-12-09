import { useMutation, useQuery } from "@tanstack/react-query";
import { getSegmentId } from "../../service/trafficFlowObservedService";

export interface SegmentParams {
  lat: number;
  lon: number;
}

function useGetSegment() {
  const { isPending, mutate: getSegment } = useMutation<
    {},
    Error,
    SegmentParams
  >({
    mutationFn: ({ lat, lon }) => getSegmentId({ lat, lon }),
  });
  return { isPending, getSegment };
}

export default useGetSegment;
