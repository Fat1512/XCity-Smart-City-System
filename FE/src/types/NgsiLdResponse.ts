export interface NgsiLdResponse<T> {
  data: T[];
  "@context": string[];
}
export interface NgsiLdProperty<T> {
  type: "Property";
  value: T;
}

export interface NgsiLdGeoProperty<T> {
  type: "GeoProperty";
  value: T;
}
