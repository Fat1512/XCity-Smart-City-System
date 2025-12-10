/*
 * -----------------------------------------------------------------------------
 * Copyright 2025 Fenwick Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -----------------------------------------------------------------------------
 */
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

    List<Alert> findByDateCreatedBetween(Instant start, Instant end, Pageable pageable);

    List<Alert> findAllBySolved(boolean isSolved);


    long countBySolvedAndDateCreatedBetween(boolean solved,
                                            Instant start, Instant end);

    @Aggregation(pipeline = {
            "{ $match: { dateCreated: { $gte: ?0, $lte: ?1 } } }",
            "{ $group: { _id: '$category', count: { $sum: 1 } } }"
    })
    List<Map<String, Object>> groupByCategory(Instant start, Instant end);

    @Aggregation(pipeline = {
            "{ $match: { dateCreated: { $gte: ?0, $lte: ?1 } } }",
            "{ $group: { _id: '$subCategory', count: { $sum: 1 } } }"
    })
    List<Map<String, Object>> groupBySubCategory(Instant start, Instant end);
}
