package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
