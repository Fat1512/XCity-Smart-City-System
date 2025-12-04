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

import { updateBuilding as updateBuildingAPI } from "../../service/buildingService";
import { useParams } from "react-router-dom";
import type { Building } from "./AdminBuilding";

export default function useUpdateBuilding() {
  const queryClient = useQueryClient();
  const { buildingId } = useParams();
  const { isPending, mutate: updateBuilding } = useMutation<
    Response,
    Error,
    Building
  >({
    mutationFn: (building) => updateBuildingAPI(building),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["building", buildingId],
      });
    },
  });
  return { isPending, updateBuilding };
}
