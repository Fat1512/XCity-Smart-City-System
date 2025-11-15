package com.tpd.XCity.entity.device;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.intellij.lang.annotations.Pattern;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "device")
public class Device {

    @Id
    private String id;
    private String name;
    private DeviceStatus deviceState;
    private String areaServed;
    private Address address;
    private List<DeviceCategoryEnum> category;
    private List<String> controlledAsset;
    private List<ControlledPropertyEnum> controlledProperty;
    @CreatedDate
    private LocalDateTime dateCreated;
    @LastModifiedDate
    private LocalDateTime dateModified;
    private String description;
    private Location location;
    private List<String> owner;
    private String provider;
    private String source;
    private String type = "Device";
}