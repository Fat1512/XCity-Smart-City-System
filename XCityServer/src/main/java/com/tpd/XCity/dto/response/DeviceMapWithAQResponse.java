package com.tpd.XCity.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceMapWithAQResponse {
    private String id;
    private Address address;
    private String name;
    private Location location;
    private AirQualityLatest airQualityLatest;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AirQualityLatest {
        private String id;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private LocalDateTime dateObserved;
        private Double so2;
        private Double co2;
        private Double o3;
        private Double pm1;
        private Double pm25;
        private Double temperature;
    }
}
