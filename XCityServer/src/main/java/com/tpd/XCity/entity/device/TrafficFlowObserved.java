package com.tpd.XCity.entity.device;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.TimeSeries;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "traffic_flow_observed")
@TimeSeries(timeField = "dateObserved", metaField = "refDevice")
public class TrafficFlowObserved {

    @Id
    private String id;
    private String type = "TrafficFlowObserved";
    private Double averageVehicleSpeed;
    private Boolean congested;
    private String dataProvider;
    private LocalDateTime dateObserved;
    private Double intensity;
    private Double occupancy;

}
