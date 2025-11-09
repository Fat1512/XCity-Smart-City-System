import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateBuilding as updateBuildingAPI } from "../../service/buildingService";
import { useParams } from "react-router-dom";
import type { Building } from "./AdminBuilding";

export default function useUpdateBuilding() {
  const queryClient = useQueryClient();
  const { buildingId } = useParams();
  const { isPending, mutate: updateBuilding } = useMutation<
    Response,
    Error,
    Building
  >({
    mutationFn: (building) => updateBuildingAPI(building),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["building", buildingId],
      });
    },
  });
  return { isPending, updateBuilding };
}
