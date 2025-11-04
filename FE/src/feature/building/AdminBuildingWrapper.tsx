import MiniSpinner from "../../ui/MiniSpinner";
import AdminBuilding from "./AdminBuilding";
import useGetBuilding from "./useGetBuilding";

const AdminBuildingWrapper = () => {
  const { isLoading, building } = useGetBuilding();
  if (isLoading) return <MiniSpinner />;
  return <AdminBuilding buildingProps={building} />;
};

export default AdminBuildingWrapper;
