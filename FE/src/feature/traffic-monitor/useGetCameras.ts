import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { getCameras } from "../../service/cameraService";

export default function useGetCameras() {
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
    queryKey: ["cameras", page, size, kw],
    queryFn: () => getCameras({ page, size, kw }),
  });
  const {
    content: cameras = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  if (page + 1 < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ["cameras", page + 1, size, kw],
      queryFn: () =>
        getCameras({
          page: page + 1,
          size,
        }),
    });
  }

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["cameras", page - 1, size, kw],
      queryFn: () =>
        getCameras({
          page: page - 1,
          size,
        }),
    });

  return { isLoading, page, cameras, totalElements, totalPages, isLast };
}
