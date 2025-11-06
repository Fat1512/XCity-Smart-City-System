import { useQuery } from "@tanstack/react-query";
import { getBuildings } from "../../../service/buildingService";
import jsonld from "jsonld";
import { JSONLD_CONTEXT } from "../../../utils/appConstant";
function useGetBuildings() {
  const { isLoading, data: buildings } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const buildings = await getBuildings();
      const compacted = await jsonld.compact(buildings ?? [], JSONLD_CONTEXT);
      return compacted;
    },
  });

  return { isLoading, buildings };
}

export default useGetBuildings;
