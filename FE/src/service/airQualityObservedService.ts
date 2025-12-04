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
import type {
  AirQualityDailyStatics,
  AirQualityMonthlyStatics,
} from "../feature/air-quality-observed/dashboard/useGetAirQualityMonthlyStatics";
import { API } from "../utils/axiosConfig";

export async function getMonthlyStatics({
  sensorId,
  month,
  year,
}: AirQualityMonthlyStatics) {
  try {
    const res = await API.get("/air/monthly-statics", {
      params: { sensorId, month, year },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}

export async function getDailyStatics({
  sensorId,
  date,
}: AirQualityDailyStatics) {
  try {
    const res = await API.get("/air/daily-statics", {
      params: { sensorId, date },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
}
