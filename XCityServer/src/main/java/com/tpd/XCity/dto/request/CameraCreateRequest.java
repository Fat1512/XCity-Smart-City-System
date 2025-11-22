package com.tpd.XCity.dto.request;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.entity.device.CameraUsage;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class CameraCreateRequest {

    private Address address;
    private String cameraName;
    private Double cameraNum;
    private String dataProvider;
    private String description;
    private CameraUsage cameraUsage;
    private Location location;
}
