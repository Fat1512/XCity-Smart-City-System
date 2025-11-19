package com.tpd.XCity.repository;

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
                    "pm1: 1, pm25: 1, co2: 1, o3: 1, temperature: 1 " +
                    "} }",

            "{ $group: { _id: '$day', " +
                    "avgPm1: { $avg: '$pm1' }, " +
                    "avgPm25: { $avg: '$pm25' }, " +
                    "avgCo2: { $avg: '$co2' }, " +
                    "avgO3: { $avg: '$o3' }, " +
                    "avgTemperature: { $avg: '$temperature' } " +
                    "} }",

            "{ $project: { _id: 0, day: '$_id', avgPm1: 1, avgPm25: 1, avgCo2: 1, avgO3: 1, avgTemperature: 1 } }",

            "{ $sort: { day: 1 } }"
    })
    List<AirQualityMonthlyStatics.AirQualityMonthlyValue> getAirQualityByMonth(String sensorId, Instant start, Instant end);
}
