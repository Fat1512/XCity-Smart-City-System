import { useQuery } from "@tanstack/react-query";

import { useParams } from "react-router-dom";
import { getBuilding } from "../../service/buildingService";
import { flattenNGSILD } from "../../utils/helper";
function useGetBuilding() {
  const { buildingId } = useParams();
  const { isLoading, data: building } = useQuery({
    queryKey: ["building", buildingId],
    queryFn: async () => {
      const building = await getBuilding(buildingId);
      const flat = flattenNGSILD(building.data);
      return flat;
    },
    enabled: !!buildingId,
  });

  return { isLoading, building };
}

export default useGetBuilding;
