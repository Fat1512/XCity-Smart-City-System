import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CameraCreate } from "./CameraAdmin";
import { updateCamera as updateCameraAPI } from "../../service/cameraService";

export default function useUpdateCamera() {
  const queryClient = useQueryClient();

  const { isPending, mutate: updateCamera } = useMutation<
    Response,
    Error,
    CameraCreate
  >({
    mutationFn: (camera) => updateCameraAPI(camera),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cameras"],
      });
    },
  });
  return { isPending, updateCamera };
}
