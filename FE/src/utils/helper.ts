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

import type { Address } from "../feature/air-quality-observed/AirQualityAdmin";

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
  const [h, m] = timeString.split(":").map(Number);

  const date = new Date();
  date.setHours(h, m, 0, 0);
  const vnDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const hh = vnDate.getHours().toString().padStart(2, "0");
  const mm = vnDate.getMinutes().toString().padStart(2, "0");

  return `${hh}:${mm}`;
}
export function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay < 1) {
    if (diffHour >= 1) return `${diffHour} giờ trước`;
    if (diffMin >= 1) return `${diffMin} phút trước`;
    return "Vừa xong";
  }

  // Format dd/MM/yyyy, HH:mm:ss
  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${dd}/${MM}/${yyyy}, ${HH}:${mm}:${ss}`;
}

export function formatTimeAgo(timestamp: number): string {
  const time = new Date(timestamp * 1000);
  console.log(timestamp);
  const now = new Date();
  const diff = now.getTime() - time.getTime();

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

export const escapeCSV = (value: any) => {
  if (value == null) return "";
  let str = String(value);

  str = str.replace(/"/g, '""');

  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str}"`;
  }

  return str;
};
export const extractAddress = (address: Address): string => {
  if (!address) return "";
  return [
    address.streetNr,
    address.streetAddress,
    address.district,
    address.addressLocality,
    address.addressRegion,
  ]
    .filter(Boolean)
    .join(", ");
};

export function epochSecondsToDateTime(
  epochSeconds: number,
  timeZone: string = "Asia/Ho_Chi_Minh"
): string {
  const date = new Date(epochSeconds * 1000);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // "2025-12-09, 00:00:00" → "2025-12-09 00:00:00"
  return formatter.format(date).replace(",", "");
}
