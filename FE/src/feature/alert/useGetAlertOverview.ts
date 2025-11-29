import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";
import { PAGE, PAGE_SIZE } from "../../utils/appConstant";
import { getAlertOverview } from "../../service/alertService";

export default function useGetAlertOverview() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const page: number = searchParams.get("page")
    ? parseInt(searchParams.get("page") as string, 10)
    : PAGE;
  const solved = searchParams.get("status") || "all";
  const size: number = searchParams.get("size")
    ? parseInt(searchParams.get("size") as string, 10)
    : PAGE_SIZE;

  const { isLoading, data } = useQuery({
    queryKey: ["alert-overview", page, size, solved],
    queryFn: () => getAlertOverview({ page, size, solved }),
  });
  const {
    content: alerts = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  if (page + 1 < totalPages) {
    queryClient.prefetchQuery({
      queryKey: ["alert-overview", page + 1, size, solved],
      queryFn: () =>
        getAlertOverview({
          page: page + 1,
          size,
          solved,
        }),
    });
  }

  if (page > 1)
    queryClient.prefetchQuery({
      queryKey: ["alert-overview", page - 1, size, solved],
      queryFn: () =>
        getAlertOverview({
          page: page - 1,
          size,
          solved,
        }),
    });

  return { isLoading, page, alerts, totalElements, totalPages, isLast };
}
