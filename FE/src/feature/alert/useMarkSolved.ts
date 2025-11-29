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
