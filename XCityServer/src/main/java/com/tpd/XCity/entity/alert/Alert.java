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
package com.tpd.XCity.entity.alert;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "alert")
public class Alert {

    @Id
    private String id;
    private Address address;
    private String alertSource;
    private AlertCategory category;
    private String dataProvider;
    @CreatedDate
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant dateCreated;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant dateIssued;
    @LastModifiedDate
    private LocalDateTime dateModified;
    private String description;
    private Location location;
    private String name;
    private String source;
    private AlertSubCategory subCategory;
    private boolean solved;
    private String type = "Alert";

}
