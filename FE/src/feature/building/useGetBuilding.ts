import { useQuery } from "@tanstack/react-query";

import { useParams } from "react-router-dom";
import { getBuilding } from "../../service/buildingService";

function useGetBuilding() {
  const { buildingId } = useParams();
  const { isLoading, data: building } = useQuery({
    queryKey: ["building", buildingId],
    queryFn: async () => getBuilding(buildingId!),
    enabled: !!buildingId,
  });

  return { isLoading, building };
}

export default useGetBuilding;
