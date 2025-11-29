package com.tpd.XCity.repository;

import com.tpd.XCity.dto.response.AlertOverviewResponse;
import com.tpd.XCity.entity.alert.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {
    Page<Alert> findBySolved(boolean solved, Pageable pageable);

    List<Alert> findByDateCreatedBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);


    long countBySolvedAndDateCreatedBetween(boolean solved,
                                            LocalDateTime start,
                                            LocalDateTime end);

    @Aggregation(pipeline = {
            "{ $match: { dateCreated: { $gte: ?0, $lte: ?1 } } }",
            "{ $group: { _id: '$category', count: { $sum: 1 } } }"
    })
    List<Map<String, Object>> groupByCategory(LocalDateTime start, LocalDateTime end);

    @Aggregation(pipeline = {
            "{ $match: { dateCreated: { $gte: ?0, $lte: ?1 } } }",
            "{ $group: { _id: '$subCategory', count: { $sum: 1 } } }"
    })
    List<Map<String, Object>> groupBySubCategory(LocalDateTime start, LocalDateTime end);
}
