package com.tpd.XCity.mapper.decorator;

import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.mapper.BuildingMapper;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@NoArgsConstructor
public abstract class AirQualityObservedMapperDecorator implements AirQualityObservedMapper {
    @Autowired
    private AirQualityObservedMapper delegate;


}
