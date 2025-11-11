package com.tpd.XCity.service.impl;

import com.tpd.XCity.entity.air.AirQualityObservedTS;
import com.tpd.XCity.entity.air.SensorMetadata;
import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.repository.AirQualityObservedRepository;
import com.tpd.XCity.repository.SensorMetadataRepository;
import com.tpd.XCity.service.AirQualityObservedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static com.tpd.XCity.utils.OrionExtractHelper.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AirQualityObservedServiceImpl implements AirQualityObservedService {
    private final AirQualityObservedRepository airQualityObservedRepository;
    private final AirQualityObservedMapper airQualityObservedMapper;
    private final SensorMetadataRepository sensorMetadataRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void saveMeasurementSensor(Map<String, Object> measurement) {
        Map<String, Object> data = (Map<String, Object>) ((List) measurement.get("data")).get(0);
        String sensorId = (String) data.get("id");
        String notifiedAtStr = (String) measurement.get("notifiedAt");
        OffsetDateTime odt = OffsetDateTime.parse(notifiedAtStr);

        SensorMetadata metadata = sensorMetadataRepository.findById(sensorId)
                .orElseThrow(() -> new RuntimeException("Sensor metadata not found"));

        LocalDateTime dateObserved = odt.toLocalDateTime();

        AirQualityObservedTS airQualityObservedTS = AirQualityObservedTS.builder()
                .sensorId(sensorId)
                .pm25(extractDouble(data, "https://smartdatamodels.org/pm25"))
                .pm1(extractDouble(data, "https://smartdatamodels.org/pm1"))
                .co2(extractDouble(data, "https://smartdatamodels.org/co2"))
                .o3(extractDouble(data, "https://smartdatamodels.org/o3"))
                .temperature(extractDouble(data, "https://smartdatamodels.org/temperature"))
                .windSpeed(extractDouble(data, "https://smartdatamodels.org/windSpeed"))
                .windDirection(extractDouble(data, "https://smartdatamodels.org/windDirection"))
                .dateObserved(dateObserved)
                .location(metadata.getLocation())   // nếu có metadata
                .name(metadata.getName())
                .address(metadata.getAddress())
                .build();
        airQualityObservedRepository.save(airQualityObservedTS);
        messagingTemplate.convertAndSend("/topic/air-quality", airQualityObservedTS);
        log.info("Saved AirQualityObservedTS entity | sensorId: {} | dateObserved: {}",
                airQualityObservedTS.getSensorId(), airQualityObservedTS.getDateObserved());
    }

}
