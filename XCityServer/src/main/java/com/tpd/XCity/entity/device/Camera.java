package com.tpd.XCity.entity.device;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.geo.GeoJson;
import org.springframework.data.mongodb.core.mapping.Document;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "camera")
public class Camera {

    @Id
    private String id;
    private Address address;
    private String cameraName;
    private Double cameraNum;
    private String dataProvider;
    @CreatedDate
    private LocalDateTime dateCreated;
    @LastModifiedDate
    private LocalDateTime dateModified;
    private String description;
    private LocalDateTime endDateTime;
    private LocalDateTime startDateTime;
    private CameraUsage cameraUsage;
    private Location location;
    private boolean on;
    private String type = "Camera";

}
