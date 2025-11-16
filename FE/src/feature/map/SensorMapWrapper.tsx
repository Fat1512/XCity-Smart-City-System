import MiniSpinner from "../../ui/MiniSpinner";
import useGetDevices from "../air-quality-observed/useGetDevices";
import SensorMap from "./SensorMap";

const SensorWrapper = () => {
  const { isLoading, devices } = useGetDevices();
  if (isLoading) return <MiniSpinner />;
  return <SensorMap sensorLocations={devices} />;
};

export default SensorWrapper;
