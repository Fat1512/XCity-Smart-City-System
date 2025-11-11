package com.tpd.XCity.repository;

import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.entity.air.AirQualityObservedTS;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AirQualityObservedRepository extends MongoRepository<AirQualityObservedTS, String> {
}
