package com.tpd.XCity.repository;

import com.tpd.XCity.entity.building.Building;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends MongoRepository<Building, String> {

    @Query(value = "{ name: { $exists: true, $regex: ?0, $options: 'i' } }",
            collation = "{ 'locale': 'vi', 'strength': 1 }")
    Page<Building> searchBuilding(String kw, Pageable pageable);
}