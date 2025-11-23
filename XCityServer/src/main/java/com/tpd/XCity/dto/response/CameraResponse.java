package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.entity.device.CameraUsage;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class CameraResponse {

    private String id;
    private Address address;
    private String cameraName;
    private String dataProvider;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private String description;
    private CameraUsage cameraUsage;
    private Location location;
    private boolean on;
    private String type = "Camera";
}
