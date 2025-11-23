package com.tpd.XCity.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrafficFlowObservedRepository extends MongoRepository<TrafficFlowObservedRepository, String> {
}
