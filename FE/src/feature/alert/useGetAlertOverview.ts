// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------
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
