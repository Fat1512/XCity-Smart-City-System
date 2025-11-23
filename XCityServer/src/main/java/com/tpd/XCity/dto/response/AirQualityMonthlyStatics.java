package com.tpd.XCity.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AirQualityMonthlyStatics {
    private String sensorId;
    private List<AirQualityMonthlyValue> dataPoints;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AirQualityMonthlyValue {

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate day;
        private Double avgPm1;
        private Double avgPm10;
        private Double avgPm25;
        private Double avgCo2;
        private Double avgO3;
        private Double avgTemperature;
        private Double avgRelativeHumidity;
    }
}
