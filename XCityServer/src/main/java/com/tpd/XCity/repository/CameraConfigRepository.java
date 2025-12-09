package com.tpd.XCity.repository;

import com.tpd.XCity.entity.device.CameraConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CameraConfigRepository extends MongoRepository<CameraConfig, String> {
    Optional<CameraConfig> findByStreamId(String streamId);
}
