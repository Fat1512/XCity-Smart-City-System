package com.tpd.XCity.dto.request;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.alert.AlertCategory;
import com.tpd.XCity.entity.alert.AlertSubCategory;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AlertCreateRequest {

    private String name;
    private Address address;
    private String alertSource;
    private AlertCategory category;
    private String dataProvider;
    private String description;
    private Location location;
    private AlertSubCategory subCategory;
}
