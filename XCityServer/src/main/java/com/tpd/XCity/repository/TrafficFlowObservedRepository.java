package com.tpd.XCity.repository;

import com.tpd.XCity.dto.response.TrafficStaticsResponse;
import com.tpd.XCity.entity.device.TrafficFlowObserved;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

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
    List<TrafficStaticsResponse.StaticsValue> getHourlyStatics(String refDevice, LocalDateTime startDate, LocalDateTime endDate);
}
