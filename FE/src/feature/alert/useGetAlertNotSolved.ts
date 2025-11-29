import { useQuery } from "@tanstack/react-query";

import { PAGE } from "../../utils/appConstant";
import { getAlertNotSolved } from "../../service/alertService";

export default function useGetAlertNotSolved() {
  const page: number = PAGE;

  const size: number = 5;

  const { isLoading, data } = useQuery({
    queryKey: ["alert-not-solved", page, size],
    queryFn: () => getAlertNotSolved({ page, size }),
  });
  const {
    content: alerts = [],
    totalElements,
    totalPages,
    isLast,
  } = data ?? {};

  return { isLoading, page, alerts, totalElements, totalPages, isLast };
}
