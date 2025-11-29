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
export const BuildingType = {
  APARTMENTS: "apartments",
  BAKEHOUSE: "bakehouse",
  BARN: "barn",
  BRIDGE: "bridge",
  BUNGALOW: "bungalow",
  BUNKER: "bunker",
  CATHEDRAL: "cathedral",
  CABIN: "cabin",
  CARPORT: "carport",
  CEMETERY: "cemetery",
  CHAPEL: "chapel",
  CHURCH: "church",
  CIVIC: "civic",
  COMMERCIAL: "commercial",
  CONSERVATORY: "conservatory",
  CONSTRUCTION: "construction",
  COWSHED: "cowshed",
  DETACHED: "detached",
  DIGESTER: "digester",
  DORMITORY: "dormitory",
  FARM: "farm",
  FARM_AUXILIARY: "farm_auxiliary",
  GARAGE: "garage",
  GARAGES: "garages",
  GARBAGE_SHED: "garbage_shed",
  GRANDSTAND: "grandstand",
  GREENHOUSE: "greenhouse",
  HANGAR: "hangar",
  HOSPITAL: "hospital",
  HOTEL: "hotel",
  HOUSE: "house",
  HOUSEBOAT: "houseboat",
  HUT: "hut",
  INDUSTRIAL: "industrial",
  KINDERGARTEN: "kindergarten",
  KIOSK: "kiosk",
  MOSQUE: "mosque",
  OFFICE: "office",
  PARKING: "parking",
  PAVILION: "pavilion",
  PUBLIC: "public",
  RESIDENTIAL: "residential",
  RETAIL: "retail",
  RIDING_HALL: "riding_hall",
  ROOF: "roof",
  RUINS: "ruins",
  SCHOOL: "school",
  SERVICE: "service",
  SHED: "shed",
  SHRINE: "shrine",
  STABLE: "stable",
  STADIUM: "stadium",
  STATIC_CARAVAN: "static_caravan",
  STY: "sty",
  SYNAGOGUE: "synagogue",
  TEMPLE: "temple",
  TERRACE: "terrace",
  TRAIN_STATION: "train_station",
  TRANSFORMER_TOWER: "transformer_tower",
  TRANSPORTATION: "transportation",
  UNIVERSITY: "university",
  WAREHOUSE: "warehouse",
  WATER_TOWER: "water_tower",
} as const;

export type BuildingType = (typeof BuildingType)[keyof typeof BuildingType];
