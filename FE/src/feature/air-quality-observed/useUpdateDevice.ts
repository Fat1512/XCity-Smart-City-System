import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DeviceCreated } from "./AirQualityAdmin";
import { updateDevice as updateDeviceAPI } from "../../service/deviceService";

export default function useUpdateDevice() {
  const queryClient = useQueryClient();

  const { isPending, mutate: updateDevice } = useMutation<
    Response,
    Error,
    DeviceCreated
  >({
    mutationFn: (device) => updateDeviceAPI(device),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: ["devices"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["device", data.id],
      });
    },
  });
  return { isPending, updateDevice };
}
