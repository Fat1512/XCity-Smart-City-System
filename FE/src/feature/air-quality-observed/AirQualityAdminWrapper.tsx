import MiniSpinner from "../../ui/MiniSpinner";

import AirQualityAdmin from "./AirQualityAdmin";
import useGetDevice from "./useGetDevice";

const AirQualityAdminWrapper = () => {
  const { isLoading, device } = useGetDevice();
  if (isLoading) return <MiniSpinner />;
  return <AirQualityAdmin deviceProps={device} />;
};

export default AirQualityAdminWrapper;
