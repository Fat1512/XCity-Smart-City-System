package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.building.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.ContainedInPlace;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class BuildingDetailResponse {
    private String id;
    private Address address;
    private String alternateName;
    private String areaServed;
    private List<BuildingCategory> category;
    private Double collapseRisk;
    private ContainedInPlace containedInPlace;
    private String dataProvider;
    private OffsetDateTime dateCreated;
    private OffsetDateTime dateModified;
    private String description;
    private Double floorsAboveGround;
    private Double floorsBelowGround;
    private Location location;
    private String mapUrl;
    private String name;
    private List<String> occupier;
    private List<String> openingHours;
    private List<String> owner;
    private Double peopleCapacity;
    private Double peopleOccupancy;
    private List<String> seeAlso;
    private String source;
    private String type = "Building";
}
