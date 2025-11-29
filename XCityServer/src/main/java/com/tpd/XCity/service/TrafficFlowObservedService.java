package com.tpd.XCity.service;

import com.tpd.XCity.dto.response.TrafficStaticsResponse;

import java.util.List;
import java.util.Map;

public interface TrafficFlowObservedService {
    void saveMeasurementSensor(Map<String, Object> measurement);

    TrafficStaticsResponse getDailyStatics(String refDevice, String date);
}
