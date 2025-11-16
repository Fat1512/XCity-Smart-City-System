package com.tpd.XCity.dto.request;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.entity.device.ControlledPropertyEnum;
import com.tpd.XCity.entity.device.DeviceCategoryEnum;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class DeviceCreateRequest {

    private String name;
    private Address address;
    private List<DeviceCategoryEnum> category;
    private List<ControlledPropertyEnum> controlledProperty;
    private String dataProvider;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private String description;
    private Location location;
    private String provider;
    private List<String> owner;
    private String source;
}
