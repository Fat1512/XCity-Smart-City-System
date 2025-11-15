import { useQuery } from "@tanstack/react-query";

import { useParams } from "react-router-dom";

import { getDevice } from "../../service/deviceService";

function useGetDevice() {
  const { deviceId } = useParams();
  const { isLoading, data: device } = useQuery({
    queryKey: ["device", deviceId],
    queryFn: async () => getDevice(deviceId!),
    enabled: !!deviceId,
  });

  return { isLoading, device };
}

export default useGetDevice;
