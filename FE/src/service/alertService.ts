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
import type { AlertCreateRequest } from "../feature/alert/useCreateAlert";
import type { PaginationParams } from "../types/PaginationParams";
import { API, AUTH_REQUEST } from "../utils/axiosConfig";
interface AlerOverviewParams extends PaginationParams {
  solved: string;
}
export async function createAlert(alert: AlertCreateRequest) {
  try {
    const res = await API.post(`/alert`, alert);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getAllAlert() {
  try {
    const res = await API.get(`/alerts`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getStatics(type: string) {
  try {
    const res = await API.get(`/alert/statics`, {
      params: {
        type,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDowloadContent(type: string) {
  try {
    const res = await API.get(`/alert/download`, {
      params: {
        type,
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getAlertNotSolved({ page, size }: PaginationParams) {
  try {
    const params: Record<string, string | number> = { page, size };
    const res = await API.get(`/alert/solved`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getAlertOverview({
  page,
  size,
  solved,
}: AlerOverviewParams) {
  try {
    const params: Record<string, string | number | boolean> = { page, size };
    if (solved !== "all") params.solved = solved === "solved";

    const res = await API.get(`/alert-notification`, { params });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function markSolved(id: string) {
  try {
    const res = await AUTH_REQUEST.put(`alert/${id}/solved`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
