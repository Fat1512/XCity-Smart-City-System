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

export function formatVietnamTime(timeString: string) {
  // timeString: "HH:mm"
  const [h, m] = timeString.split(":").map(Number);

  // Tạo Date hiện tại
  const date = new Date();
  date.setHours(h, m, 0, 0);

  // Convert sang giờ VN (UTC+7)
  const vnDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const hh = vnDate.getHours().toString().padStart(2, "0");
  const mm = vnDate.getMinutes().toString().padStart(2, "0");

  return `${hh}:${mm}`;
}
