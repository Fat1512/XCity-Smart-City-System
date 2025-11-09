package com.tpd.XCity.dto.response;

import com.tpd.XCity.dto.common.OH;
import com.tpd.XCity.entity.building.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.ContainedInPlace;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class BuildingOverviewResponse {
    private String id;
    private Address address;
    private List<BuildingCategory> category;
    private String description;
    private String name;
    private String type = "Building";
}
