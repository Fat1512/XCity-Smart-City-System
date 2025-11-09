import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { getSBuildings } from "../../service/buildingService";

export default function useGetBuildings() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const page: number = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string, 10)
    : PAGE;

  const size: number = searchParams.get("size")
    ? parseInt(searchParams.get("size") as string, 10)
    : PAGE_SIZE;

  const kw: string = searchParams.get("kw") || "";

  const { isLoading, data } = useQuery({
    queryKey: ["building", page, size, kw],
    queryFn: () => getSBuildings({ page, size, kw }),
  });
  const {
    content: buildings = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  if (page + 1 < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ["building", page + 1, size, kw],
      queryFn: () =>
        getSBuildings({
          page: page + 1,
          size,
        }),
    });
  }

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["building", page - 1, size, kw],
      queryFn: () =>
        getSBuildings({
          page: page - 1,
          size,
        }),
    });

  return { isLoading, page, buildings, totalElements, totalPages, isLast };
}
