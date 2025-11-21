package com.tpd.XCity.service.impl;

import com.sun.source.tree.Tree;
import com.tpd.XCity.dto.response.AirQualityDailyStatics;
import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;
import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.entity.device.Device;
import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.repository.AirQualityObservedRepository;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.service.AirQualityObservedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.OrionExtractHelper.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AirQualityObservedServiceImpl implements AirQualityObservedService {
    private final AirQualityObservedRepository airQualityObservedRepository;
    private final AirQualityObservedMapper airQualityObservedMapper;
    private final DeviceRepository deviceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void saveMeasurementSensor(Map<String, Object> measurement) {
        Map<String, Object> data = (Map<String, Object>) ((List) measurement.get("data")).get(0);

        String sensorId = (String) data.get("id");
        String notifiedAtStr = (String) measurement.get("notifiedAt");
        OffsetDateTime odt = OffsetDateTime.parse(notifiedAtStr);

        LocalDateTime dateObserved = odt.toLocalDateTime();

        AirQualityObserved airQualityObserved = AirQualityObserved.builder()
                .refDevice(sensorId)
                .pm25(extractDouble(data, "https://smartdatamodels.org/pm25"))
                .pm1(extractDouble(data, "https://smartdatamodels.org/pm1"))
                .co2(extractDouble(data, "https://smartdatamodels.org/co2"))
                .o3(extractDouble(data, "https://smartdatamodels.org/o3"))
                .temperature(extractDouble(data, "https://smartdatamodels.org/temperature"))
                .dateObserved(dateObserved)
                .build();
        airQualityObservedRepository.save(airQualityObserved);

        messagingTemplate.convertAndSend("/topic/air-quality",
                airQualityObservedMapper.convertToResponse(airQualityObserved));

        log.info("Saved AirQualityObservedTS entity | sensorId: {} | dateObserved: {}",
                airQualityObserved.getRefDevice(), airQualityObserved.getDateObserved());
    }

    @Override
    public AirQualityMonthlyStatics getStatics(String sensorId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        Instant start = startDate.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant end = endDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        List<AirQualityMonthlyStatics.AirQualityMonthlyValue> stats =
                airQualityObservedRepository.getAirQualityByMonth(sensorId, start, end);


        TreeMap<LocalDate, AirQualityMonthlyStatics.AirQualityMonthlyValue> map = new TreeMap<>();
        for (int d = 1; d <= startDate.lengthOfMonth(); d++) {
            LocalDate date = startDate.withDayOfMonth(d);
            AirQualityMonthlyStatics.AirQualityMonthlyValue value = AirQualityMonthlyStatics.AirQualityMonthlyValue
                    .builder()
                    .day(date)
                    .build();
            map.put(date, value);
        }

        for (AirQualityMonthlyStatics.AirQualityMonthlyValue s : stats) {
            map.put(s.getDay(), s);
        }

        return AirQualityMonthlyStatics.builder()
                .sensorId(sensorId)
                .dataPoints(map.values().stream()
                        .toList())
                .build();
    }

    @Override
    public AirQualityDailyStatics getStatics(String sensorId, String date) {
        LocalDate localDate = LocalDate.parse(date);
        ZoneId zoneVN = ZoneId.of("Asia/Ho_Chi_Minh");

        Instant start = localDate.atStartOfDay(zoneVN).toInstant();

        Instant end = localDate.atTime(LocalTime.MAX).atZone(zoneVN).toInstant();

        List<AirQualityDailyStatics.AirQualityDailyValue> values =
                airQualityObservedRepository.getAirQualityByHourRange(sensorId, start, end);


        Map<LocalDateTime, AirQualityDailyStatics.AirQualityDailyValue> valueMap = new HashMap<>();
        for (var v : values) {
            valueMap.put(v.getHour(), v);
        }


        List<AirQualityDailyStatics.AirQualityDailyValue> fullList = new ArrayList<>();

        for (int h = 0; h < 24; h++) {
            LocalDateTime hourLocalDateTime = localDate.atTime(h, 0);

            AirQualityDailyStatics.AirQualityDailyValue value = valueMap.get(h);
            if (value == null) {
                value = AirQualityDailyStatics.AirQualityDailyValue.builder()
                        .hour(hourLocalDateTime)
                        .build();
            }
            fullList.add(value);
        }

        return AirQualityDailyStatics.builder()
                .sensorId(sensorId)
                .dataPoints(fullList.stream()
                        .sorted(Comparator.comparing(AirQualityDailyStatics.AirQualityDailyValue::getHour))
                        .collect(Collectors.toList()))
                .build();
    }

}
