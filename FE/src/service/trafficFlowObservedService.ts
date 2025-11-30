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
import type { TrafficStaticsParams } from "../feature/traffic-monitor/useGetStaticsTraffic";
import type { TrafficDownloadParams } from "../feature/traffic-monitor/useTrafficDownLoad";
import { API } from "../utils/axiosConfig";

export async function getTrafficDailyStatics({
  cameraId,
  date,
}: TrafficStaticsParams) {
  try {
    const res = await API.get(`/traffic/daily-statics/${cameraId}`, {
      params: { date },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
export async function getDownLoadStatics({
  refDevices,
  date,
}: TrafficDownloadParams) {
  try {
    const res = await API.post(`/traffic/download-statics/`, {
      refDevices,
      date,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
