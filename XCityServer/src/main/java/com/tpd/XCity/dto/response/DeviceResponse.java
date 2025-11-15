package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.entity.device.ControlledPropertyEnum;
import com.tpd.XCity.entity.device.DeviceCategoryEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class DeviceResponse {

    private String id;
    private String name;
    private String areaServed;
    private Address address;
    private List<DeviceCategoryEnum> category;
    private List<String> controlledAsset;
    private List<ControlledPropertyEnum> controlledProperty;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private String description;
    private Location location;
    private List<String> owner;
    private String provider;
    private String source;
    private String type = "Device";
}
