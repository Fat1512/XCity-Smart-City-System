import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { getSBuildings } from "../../service/buildingService";

export default function useGetFoods() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const page: number = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string, 10)
    : PAGE;

  const size: number = searchParams.get("size")
    ? parseInt(searchParams.get("size") as string, 10)
    : PAGE_SIZE;

  const { isLoading, data } = useQuery({
    queryKey: ["sBuilding", page, size],
    queryFn: () => getSBuildings({ page, size }),
  });
  const {
    content: buildings = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  if (page + 1 < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ["sBuilding", page + 1, size],
      queryFn: () =>
        getSBuildings({
          page: page + 1,
          size,
        }),
    });
  }

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["sBuilding", page - 1, size],
      queryFn: () =>
        getSBuildings({
          page: page - 1,
          size,
        }),
    });

  return { isLoading, page, buildings, totalElements, totalPages, isLast };
}
