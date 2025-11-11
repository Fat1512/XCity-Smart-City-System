package com.tpd.XCity.mapper;

import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.entity.air.AirQualityObservedTS;
import com.tpd.XCity.mapper.decorator.AirQualityObservedMapperDecorator;
import com.tpd.XCity.mapper.decorator.BuildingMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

import java.util.Map;

@Mapper(componentModel = "spring")
@DecoratedWith(AirQualityObservedMapperDecorator.class)
public interface AirQualityObservedMapper {
}
