import { useQuery } from "@tanstack/react-query";
import { getDevicesMap } from "../../service/deviceService";
function useGetSensorMap() {
  const { isLoading, data: device } = useQuery({
    queryKey: ["devices-map"],
    queryFn: async () => getDevicesMap(),
  });

  return { isLoading, device };
}

export default useGetSensorMap;
