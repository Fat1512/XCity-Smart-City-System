package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.entity.device.TrafficFlowObserved;
import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.repository.AirQualityObservedRepository;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.repository.TrafficFlowObservedRepository;
import com.tpd.XCity.service.CameraService;
import com.tpd.XCity.service.TrafficFlowObservedService;
import com.tpd.XCity.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficFlowObservedServiceImpl implements TrafficFlowObservedService {

    private final TrafficFlowObservedRepository trafficFlowObservedRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void saveMeasurementSensor(Map<String, Object> measurement) {
        Map<String, Object> data = (Map<String, Object>) ((List) measurement.get("data")).get(0);

        String urnId = (String) data.get("id");
        String notifiedAtStr = (String) measurement.get("notifiedAt");

        OffsetDateTime odt = OffsetDateTime.parse(notifiedAtStr);
        LocalDateTime dateObserved = odt.toLocalDateTime();

        TrafficFlowObserved trafficFlowObserved = objectMapper.convertValue(data, TrafficFlowObserved.class);
        trafficFlowObserved.setId(urnId);
        trafficFlowObserved.setDateObserved(dateObserved);

        trafficFlowObservedRepository.save(trafficFlowObserved);
        log.info("Saved TrafficFlowObserved entity | cameraId: {} | dateObserved: {}",
                trafficFlowObserved.getRefDevice(), trafficFlowObserved.getDateObserved());
    }
}
