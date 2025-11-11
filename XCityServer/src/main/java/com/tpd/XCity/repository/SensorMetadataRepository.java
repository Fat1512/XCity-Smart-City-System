package com.tpd.XCity.repository;

import com.tpd.XCity.entity.air.SensorMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorMetadataRepository extends MongoRepository<SensorMetadata, String> {
}
