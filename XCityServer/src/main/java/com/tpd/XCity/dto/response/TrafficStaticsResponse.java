package com.tpd.XCity.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficStaticsResponse {

    private String refDevice;
    private List<StaticsValue> dataPoints;
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StaticsValue {

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime hour;
        private Integer totalIntensity;
        private Double avgSpeed;
    }
}
