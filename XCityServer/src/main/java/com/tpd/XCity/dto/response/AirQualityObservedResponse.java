package com.tpd.XCity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirQualityObservedResponse {

    private String id;
    private String name;
    private String dataProvider;
    private LocalDateTime dateModified;
    private LocalDateTime dateObserved;
    private String description;
    private Double so2;
    private Double co2;
    private Double o3;
    private Double pm1;
    private Double pm25;
    private Double temperature;
    private String refDevice;
    private String deviceName;
    private String source;
}
