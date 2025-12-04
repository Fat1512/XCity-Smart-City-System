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
