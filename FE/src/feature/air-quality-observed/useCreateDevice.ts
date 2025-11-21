import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { DeviceCreated } from "./AirQualityAdmin";
import { createDevice as createDeviceAPI } from "../../service/deviceService";

export default function useCreateDevice() {
  const queryClient = useQueryClient();

  const { isPending, mutate: createDevice } = useMutation<
    Response,
    Error,
    DeviceCreated
  >({
    mutationFn: (device) => createDeviceAPI(device),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });
    },
  });
  return { isPending, createDevice };
}
