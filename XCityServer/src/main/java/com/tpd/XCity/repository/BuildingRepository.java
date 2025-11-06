package com.tpd.XCity.repository;

import com.tpd.XCity.entity.building.Building;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends MongoRepository<Building, String> {
}
