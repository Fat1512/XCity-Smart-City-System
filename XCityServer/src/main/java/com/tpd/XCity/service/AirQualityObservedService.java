package com.tpd.XCity.service;

import com.tpd.XCity.dto.response.AirQualityDailyStatics;
import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;

import java.util.List;
import java.util.Map;

public interface AirQualityObservedService {
    void saveMeasurementSensor(Map<String, Object> measurement);

    AirQualityMonthlyStatics getStatics(String sensorId, int year, int month);

    AirQualityDailyStatics getStatics(String sensorId, String date);
}
