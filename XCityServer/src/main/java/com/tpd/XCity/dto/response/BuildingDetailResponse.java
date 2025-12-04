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
package com.tpd.XCity.dto.response;

import com.tpd.XCity.dto.common.OH;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.ContainedInPlace;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class BuildingDetailResponse {
    private String id;
    private Address address;
    private List<BuildingCategory> category;
    private Double collapseRisk;
    private ContainedInPlace containedInPlace;
    private String dataProvider;
    private Instant dateCreated;
    private Instant dateModified;
    private String description;
    private Double floorsAboveGround;
    private Double floorsBelowGround;
    private Location location;
    private String name;
    private List<String> owner;
    private Double peopleCapacity;
    private Double peopleOccupancy;
    private String type = "Building";
    private Map<String, OH> openingHours;

}
