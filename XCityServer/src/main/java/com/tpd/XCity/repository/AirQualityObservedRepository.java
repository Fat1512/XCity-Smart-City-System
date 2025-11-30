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

import com.tpd.XCity.dto.response.AirQualityDailyStatics;
import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;
import com.tpd.XCity.entity.air.AirQualityObserved;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AirQualityObservedRepository extends MongoRepository<AirQualityObserved, String> {

    @Aggregation(pipeline = {
            "{ $match: { " +
                    "dateObserved: { $gte: ?1, $lt: ?2 }, " +
                    "refDevice: ?0 " +
                    "} }",

            "{ $project: { " +
                    "day: { $dateTrunc: { date: '$dateObserved', unit: 'day' } }, " +
                    "pm1: 1, pm10: 1, pm25: 1, co2: 1, o3: 1, temperature: 1, relativeHumidity: 1 " +
                    "} }",

            "{ $group: { _id: '$day', " +
                    "avgPm1: { $avg: '$pm1' }, " +
                    "avgPm10: { $avg: '$pm10' }, " +
                    "avgPm25: { $avg: '$pm25' }, " +
                    "avgCo2: { $avg: '$co2' }, " +
                    "avgO3: { $avg: '$o3' }, " +
                    "avgTemperature: { $avg: '$temperature' }, " +
                    "avgRelativeHumidity: { $avg: 'relativeHumidity' } " +
                    "} }",

            "{ $project: { _id: 0, day: '$_id', avgPm1: 1, avgPm10: 1, avgPm25: 1, avgCo2: 1, avgO3: 1, avgTemperature: 1, avgRelativeHumidity: 1 } }",

            "{ $sort: { day: 1 } }"
    })
    List<AirQualityMonthlyStatics.AirQualityMonthlyValue> getAirQualityByMonth(String sensorId, Instant start, Instant end);

    @Aggregation(pipeline = {
            "{ $match: { " +
                    "dateObserved: { $gte: ?1, $lt: ?2 }, " +
                    "refDevice: ?0 " +
                    "} }",
            "{ $project: { " +
                    "hour: { $dateTrunc: { date: '$dateObserved', unit: 'hour' } }, " +
                    "pm1: 1, pm10: 1, pm25: 1, co2: 1, o3: 1, temperature: 1, relativeHumidity: 1 " +
                    "} }",
            "{ $group: { _id: '$hour', " +
                    "avgPm1: { $avg: '$pm1' }, " +
                    "avgPm10: { $avg: '$pm10' }, " +
                    "avgPm25: { $avg: '$pm25' }, " +
                    "avgCo2: { $avg: '$co2' }, " +
                    "avgO3: { $avg: '$o3' }, " +
                    "avgTemperature: { $avg: '$temperature' }, " +
                    "avgRelativeHumidity: { $avg: 'relativeHumidity' } " +
                    "} }",
            "{ $project: { _id: 0, hour: '$_id', avgPm1: 1, avgPm10: 1, avgPm25: 1, avgCo2: 1, avgO3: 1, avgTemperature: 1, avgRelativeHumidity: 1} }",
            "{ $sort: { hour: 1 } }"
    })
    List<AirQualityDailyStatics.AirQualityDailyValue> getAirQualityByHourRange(
            String sensorId,
            Instant start,
            Instant end
    );
}
