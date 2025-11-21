package com.tpd.XCity.mapper;

import com.tpd.XCity.dto.response.AirQualityObservedResponse;
import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.mapper.decorator.AirQualityObservedMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
@DecoratedWith(AirQualityObservedMapperDecorator.class)
public interface AirQualityObservedMapper {

    AirQualityObservedResponse convertToResponse(AirQualityObserved qualityObserved);
}
