package com.tpd.XCity.dto.request;

import com.tpd.XCity.dto.common.OH;
import com.tpd.XCity.entity.building.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.ContainedInPlace;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class BuildingUpdateRequest {

    private Address address;
    private String alternateName;
    private String areaServed;
    private List<BuildingCategory> category;
    private Double collapseRisk;
    private ContainedInPlace containedInPlace;
    private String dataProvider;
    private String description;
    private Double floorsAboveGround;
    private Double floorsBelowGround;
    private Location location;
    private String name;
    private List<String> occupier;
    private Map<String, OH> openingHours;
    private List<String> owner;
    private Double peopleCapacity;
    private Double peopleOccupancy;
    private String type = "Building";

}
