package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.Data;

@Data
public class DeviceLocation {
    private String id;
    private Address address;
    private String name;
    private Location location;
}
