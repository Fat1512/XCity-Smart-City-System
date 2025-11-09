export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}
export const getAccessToken = () => {
  const token = window.localStorage.getItem("access_token");
  if (token == null) return null;
  return token;
};
export const getRefreshToken = () => {
  const token = window.localStorage.getItem("refresh_token");
  if (token == null) return null;
  return token;
};
export const setAccessToken = (token: string) => {
  window.localStorage.setItem("access_token", token);
};
export const setRefreshToken = (token: string) => {
  window.localStorage.setItem("refresh_token", token);
};
export const removeLocalStorageToken = () => {
  window.localStorage.removeItem("refresh_token");
};
export const clearToken = () => {
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("access_token");
};
export const flattenNGSILD = (entity: any) => {
  if (!entity) return null;

  const result: Record<string, any> = { id: entity.id, type: entity.type };

  for (const [key, value] of Object.entries(entity)) {
    if (key === "id" || key === "type") continue;

    if (value?.type === "Property") {
      result[key] = value.value;
    } else if (value?.type === "GeoProperty") {
      result[key] = value.value;
    } else {
      result[key] = value;
    }
  }

  return result;
};
