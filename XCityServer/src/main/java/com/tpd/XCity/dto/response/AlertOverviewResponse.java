package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.alert.AlertCategory;
import com.tpd.XCity.entity.alert.AlertSubCategory;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertOverviewResponse {

    private String id;
    private AlertCategory category;
    private AlertSubCategory subCategory;
    private Instant dateCreated;
    private Location location;
    private String name;
    private String description;
}
