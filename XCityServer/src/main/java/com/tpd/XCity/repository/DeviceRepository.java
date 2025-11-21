package com.tpd.XCity.repository;

import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.device.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceRepository extends MongoRepository<Device, String> {
    @Query(value = "{ name: { $exists: true, $regex: ?0, $options: 'i' } }",
            collation = "{ 'locale': 'vi', 'strength': 1 }")
    Page<Device> searchDevice(String kw, Pageable pageable);
}
