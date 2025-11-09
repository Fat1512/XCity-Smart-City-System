import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBuilding as createBuildingAPI } from "../../service/buildingService";
import { useParams } from "react-router-dom";
import type { Building } from "./AdminBuilding";

export default function useCreateBuilding() {
  const queryClient = useQueryClient();
  const { buildingId } = useParams();
  const { isPending, mutate: createBuilding } = useMutation<
    Response,
    Error,
    Building
  >({
    mutationFn: (building) => createBuildingAPI(building),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["building", buildingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["building", buildingId],
      });
    },
  });
  return { isPending, createBuilding };
}
