import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CameraCreate } from "./CameraAdmin";
import { createCamera as createCameraAPI } from "../../service/cameraService";

export default function useCreateCamera() {
  const queryClient = useQueryClient();

  const { isPending, mutate: createCamera } = useMutation<
    Response,
    Error,
    CameraCreate
  >({
    mutationFn: (camera) => createCameraAPI(camera),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cameras"],
      });
    },
  });
  return { isPending, createCamera };
}
