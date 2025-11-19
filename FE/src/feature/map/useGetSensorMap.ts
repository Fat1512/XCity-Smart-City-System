import { useQuery } from "@tanstack/react-query";
import { getDevicesMap } from "../../service/deviceService";
function useGetSensorMap() {
  const { isLoading, data: devices } = useQuery({
    queryKey: ["devices-map"],
    queryFn: async () => getDevicesMap(),
  });

  return { isLoading, devices };
}

export default useGetSensorMap;
