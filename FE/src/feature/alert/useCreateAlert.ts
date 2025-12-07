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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAlert as createAlertAPI } from "../../service/alertService";
import type {
  Address,
  Location,
} from "../air-quality-observed/AirQualityAdmin";
import type { Response } from "../../types";

export interface AlertCreateRequest {
  name?: string;
  description?: string;
  address?: Address;
  category?: string;
  location: Location;
  subCategory?: string;
}

export default function useCreateAlert() {
  const queryClient = useQueryClient();

  const { isPending, mutate: createAlert } = useMutation<
    Response,
    Error,
    AlertCreateRequest
  >({
    mutationFn: (alert) => createAlertAPI(alert),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alerts"],
      });
    },
  });
  return { isPending, createAlert };
}
