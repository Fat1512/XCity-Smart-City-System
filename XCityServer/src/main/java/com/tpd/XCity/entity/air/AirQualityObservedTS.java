package com.tpd.XCity.entity.air;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.TimeSeries;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "air_quality_observed")
@TimeSeries(timeField = "dateObserved", metaField = "sensorId")
public class AirQualityObservedTS {
    @Id
    private String id;

    private String sensorId;
    private Location location;
    private String name;
    private Address address;
    private Double airQualityIndex;
    private String airQualityLevel;
    private String areaServed;
    private Double co2;
    private String dataProvider;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private LocalDateTime dateObserved;
    private String description;
    private Double o3;
    private Double pm1;
    private Double pm25;
    private Double precipitation;
    private String refDevice;
    private String refWeatherObserved;
    private Double relativeHumidity;
    private Double reliability;
    private Double so2;
    private String source;
    private Double temperature;
    private Double windDirection;
    private Double windSpeed;
}
