// -----------------------------------------------------------------------------
// Copyright 2025 Fenwick Team
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// -----------------------------------------------------------------------------

import type { NgsiLdProperty, NgsiLdGeoProperty } from "../../../types/index";
import Map from "./Map";

import MiniSpinner from "../../../ui/MiniSpinner";
import useGetBuildingMap from "./useGetBuildingMap";
import type { Address } from "../../air-quality-observed/AirQualityAdmin";

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
  const { isLoading, buildings } = useGetBuildingMap();

  if (isLoading) return <MiniSpinner />;

  return <Map buildings={buildings} />;
};

export default BuildingList;
