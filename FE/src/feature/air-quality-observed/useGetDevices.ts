import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { getDevices } from "../../service/deviceService";

export default function useGetDevices() {
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
    queryKey: ["devices", page, size, kw],
    queryFn: () => getDevices({ page, size, kw }),
  });
  const {
    content: devices = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  if (page + 1 < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ["devices", page + 1, size, kw],
      queryFn: () =>
        getDevices({
          page: page + 1,
          size,
        }),
    });
  }

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["devices", page - 1, size, kw],
      queryFn: () =>
        getDevices({
          page: page - 1,
          size,
        }),
    });

  return { isLoading, page, devices, totalElements, totalPages, isLast };
}
