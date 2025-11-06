import useGetBuildings from "./useGetBuildings";
import type { NgsiLdProperty, NgsiLdGeoProperty } from "../../../types/index";
import Map from "./Map";
import type { Address } from "../AdminBuilding";

export interface Building {
  id: string;
  type: "Building";
  name?: NgsiLdProperty<string>;
  category?: NgsiLdProperty<string>;
  description?: NgsiLdProperty<string>;
  address?: NgsiLdProperty<Address>;
  floorsAboveGround?: NgsiLdProperty<number>;
  floorsBelowGround?: NgsiLdProperty<number>;
  location: NgsiLdGeoProperty<Polygon>;
}
export interface Polygon {
  type: "Polygon";
  coordinates: number[][][];
}

const BuildingList = () => {
  const { isLoading, buildings } = useGetBuildings();

  if (isLoading) return <div>Loading...</div>;

  if (!buildings?.data?.length) return <div>No buildings found</div>;

  return <Map buildings={buildings.data} />;
};

export default BuildingList;
