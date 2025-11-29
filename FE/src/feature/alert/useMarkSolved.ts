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
import { markSolved as markSolvedAPI } from "../../service/alertService";

export default function useMarkSolved() {
  const queryClient = useQueryClient();

  const { isPending, mutate: markSolved } = useMutation<
    Response,
    Error,
    { id: string }
  >({
    mutationFn: ({ id }) => markSolvedAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alert-overview"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["alert-not-solved"],
        exact: false,
      });
    },
  });
  return { isPending, markSolved };
}
