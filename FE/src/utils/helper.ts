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

export function formatTimeAgo(timestamp: number): string {
  // Chuyển timestamp sang mili giây (nếu timestamp đang là giây)
  const time = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - time.getTime(); // difference in ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return `${seconds} giây trước`;
}
export const mapToLabels = (dataMap, sourceList) => {
  if (!dataMap) return {};

  const result = {};

  Object.entries(dataMap).forEach(([key, value]) => {
    const found = sourceList.find((item) => item.value === key);
    const label = found ? found.label : key;
    result[label] = value;
  });

  return result;
};
