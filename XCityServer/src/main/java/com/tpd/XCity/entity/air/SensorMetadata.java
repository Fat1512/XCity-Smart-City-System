package com.tpd.XCity.entity.air;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sensor_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorMetadata {

    @Id
    private String sensorId;
    private Location location;
    private String name;
    private Address address;
}