const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
export async function geocodeAddress(address: string) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    address
  )}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features?.length) return null;

  return data.features[0].geometry.coordinates;
}
