package com.tpd.XCity.entity.building;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContainedInPlace {
    private List<Double> bbox;
    private Object coordinates;
    private GeoJsonType type;
}
