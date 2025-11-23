package com.tpd.XCity.repository;

import com.tpd.XCity.entity.device.TrafficFlowObserved;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrafficFlowObservedRepository extends MongoRepository<TrafficFlowObserved, String> {
}
