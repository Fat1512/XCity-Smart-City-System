import { useQuery } from "@tanstack/react-query";

import { getAllAlert } from "../../service/alertService";

function useGetAllAlert() {
  const { isLoading, data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => getAllAlert(),
  });

  return { isLoading, alerts };
}

export default useGetAllAlert;
