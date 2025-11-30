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
package com.tpd.XCity.entity.building;

import com.tpd.XCity.entity.Address;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "building")
public class Building {
    @Id
    private String id;
    private Address address;
    private List<BuildingCategory> category;
    private Double collapseRisk;
    private ContainedInPlace containedInPlace;
    private String dataProvider;
    @CreatedDate
    private Instant dateCreated;
    @LastModifiedDate
    private Instant dateUpdated;
    private String description;
    private Double floorsAboveGround;
    private Double floorsBelowGround;
    private Location location;
    private String name;
    private List<String> openingHours;
    private List<String> owner;
    private Double peopleCapacity;
    private Double peopleOccupancy;
    private List<String> seeAlso;
    private String source;
    private String type = "Building";

}
