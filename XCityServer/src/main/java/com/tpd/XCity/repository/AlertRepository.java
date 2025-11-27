package com.tpd.XCity.repository;

import com.tpd.XCity.entity.alert.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

}
