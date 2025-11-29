import { useMutation } from "@tanstack/react-query";
import type { Alert } from "./AlertDetail";
import { getDowloadContent } from "../../service/alertService";

export default function useDownLoadAlert() {
  const { isPending, mutate: download } = useMutation<
    Alert[],
    Error,
    { type: string }
  >({
    mutationFn: ({ type }) => getDowloadContent(type),
  });
  return { isPending, download };
}
