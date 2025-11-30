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
package com.tpd.XCity.entity.air;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.TimeSeries;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "air_quality_observed")
@TimeSeries(timeField = "dateObserved", metaField = "refDevice")
public class AirQualityObserved {

    @Id
    private String id;
    private String name;
    private String dataProvider;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private LocalDateTime dateObserved;
    private String description;

    private Double so2;
    private Double co2;
    private Double o3;
    private Double pm1;
    private Double pm10;
    private Double relativeHumidity;
    private Double pm25;
    private Double temperature;

    private String refDevice;
    private String type = "AirQualityObserved";
    private String source;

}
