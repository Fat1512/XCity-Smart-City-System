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
import { getBuildings } from "../../../service/buildingService";
import jsonld from "jsonld";
import { JSONLD_CONTEXT } from "../../../utils/appConstant";
function useGetBuildings() {
  const { isLoading, data: buildings } = useQuery({
    queryKey: ["sBuildings"],
    queryFn: async () => {
      const buildings = await getBuildings();
      const compacted = await jsonld.compact(buildings ?? [], JSONLD_CONTEXT);
      return compacted;
    },
  });

  return { isLoading, buildings };
}

export default useGetBuildings;
