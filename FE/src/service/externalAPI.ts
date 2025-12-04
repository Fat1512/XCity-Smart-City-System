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
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(address: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features?.length) return null;

  return data.features[0].geometry.coordinates;
}

export const searchLocation = async (query: string) => {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(
    query + " Hồ Chí Minh"
  )}&format=json&addressdetails=1&limit=5`;

  const res = await fetch(url);
  return res.json();
};
export async function getRoadNameFromCoordinate([lng, lat]: [number, number]) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.address?.road || "Không xác định";
}
