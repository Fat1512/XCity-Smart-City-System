package com.tpd.XCity.repository;

import com.tpd.XCity.entity.device.Camera;
import com.tpd.XCity.entity.device.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CameraRepository extends MongoRepository<Camera, String> {
    @Query(value = "{ cameraName: { $exists: true, $regex: ?0, $options: 'i' } }",
            collation = "{ 'locale': 'vi', 'strength': 1 }")
    Page<Camera> searchCamera(String kw, Pageable pageable);
}
