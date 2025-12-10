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
package com.tpd.XCity.repository;

import com.tpd.XCity.dto.response.TrafficStaticsResponse;
import com.tpd.XCity.entity.device.TrafficFlowObserved;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Repository
public interface TrafficFlowObservedRepository extends MongoRepository<TrafficFlowObserved, String> {
    @Aggregation(pipeline = {
            "{ $match: { refDevice: ?0, dateObserved: { $gte: ?1, $lte: ?2 } } }",
            "{ $group: { " +
                    "    _id: { $dateTrunc: { date: '$dateObserved', unit: 'hour' } }, " +
                    "    totalIntensity: { $sum: '$intensity' }, " +
                    "    avgSpeed: { $avg: '$averageVehicleSpeed' } " +
                    "} }",
            "{ $project: { " +
                    "    hour: '$_id', " +
                    "    totalIntensity: 1, " +
                    "    avgSpeed: 1 " +
                    "} }",
            "{ $sort: { 'hour': 1 } }"
    })
    List<TrafficStaticsResponse.StaticsValue> getHourlyStatics(String refDevice, Instant start,
                                                               Instant end);
}
