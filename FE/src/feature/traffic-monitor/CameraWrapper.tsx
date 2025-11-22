import MiniSpinner from "../../ui/MiniSpinner";
import CameraAdmin, { type CameraCreate } from "./CameraAdmin";
import useGetCamera from "./useGetCamera";

const CameraWrapper = () => {
  const { isLoading, camera } = useGetCamera();
  if (isLoading) return <MiniSpinner />;
  const cameraCreate: CameraCreate = camera;
  return <CameraAdmin cameraProps={cameraCreate} />;
};

export default CameraWrapper;
