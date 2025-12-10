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
import type { ContextDefinition } from "jsonld";
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export const JSONLD_CONTEXT: ContextDefinition = {
  "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
};
export const PAGE_SIZE = 10;
export const PAGE = 0;
export const DEFAULT_LAT = 10.772;
export const DEFAULT_LNG = 106.667;
export const BUILDING_TYPES = [
  { label: "Apartments", value: "APARTMENTS" },
  { label: "Bakehouse", value: "BAKEHOUSE" },
  { label: "Barn", value: "BARN" },
  { label: "Bridge", value: "BRIDGE" },
  { label: "Bungalow", value: "BUNGALOW" },
  { label: "Bunker", value: "BUNKER" },
  { label: "Cathedral", value: "CATHEDRAL" },
  { label: "Cabin", value: "CABIN" },
  { label: "Carport", value: "CARPORT" },
  { label: "Cemetery", value: "CEMETERY" },
  { label: "Chapel", value: "CHAPEL" },
  { label: "Church", value: "CHURCH" },
  { label: "Civic", value: "CIVIC" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Conservatory", value: "CONSERVATORY" },
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Cowshed", value: "COWSHED" },
  { label: "Detached", value: "DETACHED" },
  { label: "Digester", value: "DIGESTER" },
  { label: "Dormitory", value: "DORMITORY" },
  { label: "Farm", value: "FARM" },
  { label: "Farm Auxiliary", value: "FARM_AUXILIARY" },
  { label: "Garage", value: "GARAGE" },
  { label: "Garages", value: "GARAGES" },
  { label: "Garbage Shed", value: "GARBAGE_SHED" },
  { label: "Grandstand", value: "GRANDSTAND" },
  { label: "Greenhouse", value: "GREENHOUSE" },
  { label: "Hangar", value: "HANGAR" },
  { label: "Hospital", value: "HOSPITAL" },
  { label: "Hotel", value: "HOTEL" },
  { label: "House", value: "HOUSE" },
  { label: "Houseboat", value: "HOUSEBOAT" },
  { label: "Hut", value: "HUT" },
  { label: "Industrial", value: "INDUSTRIAL" },
  { label: "Kindergarten", value: "KINDERGARTEN" },
  { label: "Kiosk", value: "KIOSK" },
  { label: "Mosque", value: "MOSQUE" },
  { label: "Office", value: "OFFICE" },
  { label: "Parking", value: "PARKING" },
  { label: "Pavilion", value: "PAVILION" },
  { label: "Public", value: "PUBLIC" },
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Retail", value: "RETAIL" },
  { label: "Riding Hall", value: "RIDING_HALL" },
  { label: "Roof", value: "ROOF" },
  { label: "Ruins", value: "RUINS" },
  { label: "School", value: "SCHOOL" },
  { label: "Service", value: "SERVICE" },
  { label: "Shed", value: "SHED" },
  { label: "Shrine", value: "SHRINE" },
  { label: "Stable", value: "STABLE" },
  { label: "Stadium", value: "STADIUM" },
  { label: "Static Caravan", value: "STATIC_CARAVAN" },
  { label: "Sty", value: "STY" },
  { label: "Synagogue", value: "SYNAGOGUE" },
  { label: "Temple", value: "TEMPLE" },
  { label: "Terrace", value: "TERRACE" },
  { label: "Train Station", value: "TRAIN_STATION" },
  { label: "Transformer Tower", value: "TRANSFORMER_TOWER" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "University", value: "UNIVERSITY" },
  { label: "Warehouse", value: "WAREHOUSE" },
  { label: "Water Tower", value: "WATER_TOWER" },
];

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// constants/deviceConstants.ts
export const DEVICE_CATEGORIES = [
  { label: "Actuator", value: "actuator" },
  { label: "Beacon", value: "beacon" },
  { label: "Implement", value: "implement" },
  { label: "Irr Section", value: "irrSection" },
  { label: "Irr System", value: "irrSystem" },
  { label: "Meter", value: "meter" },
  { label: "Multimedia", value: "multimedia" },
  { label: "Network", value: "network" },
  { label: "Sensor", value: "sensor" },
];

export const CAMERA_USAGE = [
  { label: "Surveillance", value: "SURVEILLANCE" },
  { label: "RLVD", value: "RLVD" },
  { label: "Traffic", value: "TRAFFIC" },
];
export const CONTROLLED_PROPERTIES = [
  { label: "Air Pollution", value: "airPollution" },
  { label: "Atmospheric Pressure", value: "atmosphericPressure" },
  { label: "Average Velocity", value: "averageVelocity" },
  { label: "Battery Life", value: "batteryLife" },
  { label: "Battery Supply", value: "batterySupply" },
  { label: "Conductance", value: "conductance" },
  { label: "Conductivity", value: "conductivity" },
  { label: "Depth", value: "depth" },
  { label: "Eating Activity", value: "eatingActivity" },
  { label: "Electricity Consumption", value: "electricityConsumption" },
  { label: "Energy", value: "energy" },
  { label: "Filling Level", value: "fillingLevel" },
  { label: "Free Chlorine", value: "freeChlorine" },
  { label: "Gas Consumption", value: "gasConsumption" },
  { label: "Gate Opening", value: "gateOpening" },
  { label: "Heading", value: "heading" },
  { label: "Humidity", value: "humidity" },
  { label: "Light", value: "light" },
  { label: "Location", value: "location" },
  { label: "Milking", value: "milking" },
  { label: "Motion", value: "motion" },
  { label: "Movement Activity", value: "movementActivity" },
  { label: "Noise Level", value: "noiseLevel" },
  { label: "Occupancy", value: "occupancy" },
  { label: "ORP", value: "orp" },
  { label: "pH", value: "pH" },
  { label: "Power", value: "power" },
  { label: "Precipitation", value: "precipitation" },
  { label: "Pressure", value: "pressure" },
  { label: "Refractive Index", value: "refractiveIndex" },
  { label: "Salinity", value: "salinity" },
  { label: "Smoke", value: "smoke" },
  { label: "Soil Moisture", value: "soilMoisture" },
  { label: "Solar Radiation", value: "solarRadiation" },
  { label: "Speed", value: "speed" },
  { label: "TDS", value: "tds" },
  { label: "Temperature", value: "temperature" },
  { label: "Traffic Flow", value: "trafficFlow" },
  { label: "TSS", value: "tss" },
  { label: "Turbidity", value: "turbidity" },
  { label: "UV Lamp Intensity", value: "uvLampIntensity" },
  { label: "UV Organic Load", value: "uvOrganicLoad" },
  { label: "Water Consumption", value: "waterConsumption" },
  { label: "Water Flow", value: "waterFlow" },
  { label: "Water Level", value: "waterLevel" },
  { label: "Water Pollution", value: "waterPollution" },
  { label: "Weather Conditions", value: "weatherConditions" },
  { label: "Weight", value: "weight" },
];

export const FORMAT = [
  {
    label: "CSV",
    color: "blue",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    label: "JSON",
    color: "purple",
    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  },
  {
    label: "HTML",
    color: "orange",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

export const ALERT_CATEGORIES = [
  { value: "traffic", label: "Giao thông" },
  { value: "naturalDisaster", label: "Thiên tai" },
  { value: "weather", label: "Thời tiết" },
  { value: "environment", label: "Môi trường" },
  { value: "health", label: "Sức khỏe" },
  { value: "security", label: "An ninh" },
  { value: "agriculture", label: "Nông nghiệp" },
];

export const ALERT_SUB_CATEGORIES = [
  { value: "airPollution", label: "Ô nhiễm không khí" },
  { value: "buildingFire", label: "Cháy tòa nhà" },
  { value: "carAccident", label: "Tai nạn xe hơi" },
  { value: "earthquake", label: "Động đất" },
  { value: "flood", label: "Lũ lụt" },
  { value: "floodRisk", label: "Nguy cơ lũ" },
  { value: "forestFire", label: "Cháy rừng" },
  { value: "highTemperature", label: "Nhiệt độ cao" },
  { value: "hurricane", label: "Bão" },
  { value: "injuredBiker", label: "Tai nạn xe máy" },
  { value: "lowTemperature", label: "Nhiệt độ thấp" },
  { value: "nematodes", label: "Tuyến trùng" },
  { value: "noxiousWeed", label: "Cỏ độc hại" },
  { value: "roadClosed", label: "Đường đóng" },
  { value: "roadWorks", label: "Công trình đường" },
  { value: "thunderstorms", label: "Dông sét" },
  { value: "tornado", label: "Lốc xoáy" },
  { value: "trafficJam", label: "Kẹt xe" },
  { value: "tropicalCyclone", label: "Bão nhiệt đới" },
  { value: "tsunami", label: "Sóng thần" },
];

export const DEFAULT_CITY = "Hồ Chí Minh";
