package com.tpd.XCity.dto.response;

import com.tpd.XCity.dto.common.OH;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.entity.building.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.ContainedInPlace;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
