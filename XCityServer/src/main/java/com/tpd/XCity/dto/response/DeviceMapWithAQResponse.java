/*
 * -----------------------------------------------------------------------------
 * Copyright 2025 Fenwick Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -----------------------------------------------------------------------------
 */
package com.tpd.XCity.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceMapWithAQResponse {
    private String id;
    private Address address;
    private String name;
    private Location location;
    private AirQualityLatest airQualityLatest;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AirQualityLatest {
        private String id;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private LocalDateTime dateObserved;
        private Double so2;
        private Double co2;
        private Double o3;
        private Double pm1;
        private Double pm25;
        private Double temperature;
    }
}
