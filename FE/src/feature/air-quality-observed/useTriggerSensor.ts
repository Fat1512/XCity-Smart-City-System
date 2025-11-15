import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startSensor, stopSensor } from "../../service/deviceService";
import type { DeviceCreated } from "./AirQualityAdmin";

export default function useTriggerSensor() {
  const queryClient = useQueryClient();

  const { isPending, mutate: triggerSensor } = useMutation<
    Response,
    Error,
    DeviceCreated
  >({
    mutationFn: async ({ id, deviceState }) => {
      if (deviceState === "active") {
        return await startSensor(id!);
      } else {
        return await stopSensor(id!);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });
    },
  });

  return { isPending, triggerSensor };
}
