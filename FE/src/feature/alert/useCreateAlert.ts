import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAlert as createAlertAPI } from "../../service/alertService";
import type {
  Address,
  Location,
} from "../air-quality-observed/AirQualityAdmin";

export interface AlertCreateRequest {
  name?: string;
  description?: string;
  address?: Address;
  category?: string;
  location?: Location;
  subCategory?: string;
}

export default function useCreateAlert() {
  const queryClient = useQueryClient();

  const { isPending, mutate: createAlert } = useMutation<
    Response,
    Error,
    AlertCreateRequest
  >({
    mutationFn: (alert) => createAlertAPI(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alerts"],
      });
    },
  });
  return { isPending, createAlert };
}
