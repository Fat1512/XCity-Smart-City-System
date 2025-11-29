import { useQuery } from "@tanstack/react-query";

import { getStatics } from "../../service/alertService";
import { useSearchParams } from "react-router-dom";

function useGetAlertStatics() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "today";

  const { isLoading, data: statics } = useQuery({
    queryKey: ["alert-statics", type],
    queryFn: () => getStatics(type),
  });

  return { isLoading, statics };
}

export default useGetAlertStatics;
