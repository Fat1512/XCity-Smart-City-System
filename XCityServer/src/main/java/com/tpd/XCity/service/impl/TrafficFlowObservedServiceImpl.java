/*
 * -----------------------------------------------------------------------------
 * Copyright 2025 Fenwick Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -----------------------------------------------------------------------------
 */
package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.response.AirQualityDailyStatics;
import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;
import com.tpd.XCity.dto.response.TrafficStaticsResponse;
import com.tpd.XCity.entity.device.TrafficFlowObserved;
import com.tpd.XCity.exception.BadRequestException;
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

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrafficFlowObservedServiceImpl implements TrafficFlowObservedService {

    private final TrafficFlowObservedRepository trafficFlowObservedRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void saveMeasurementSensor(Map<String, Object> measurement) {
        Map<String, Object> data = (Map<String, Object>) ((List) measurement.get("data")).get(0);
        data.remove("id");

        String urnId = (String) data.get("id");
        String notifiedAtStr = (String) measurement.get("notifiedAt");

        OffsetDateTime odt = OffsetDateTime.parse(notifiedAtStr);
        LocalDateTime dateObserved = odt.toLocalDateTime();

        TrafficFlowObserved trafficFlowObserved = objectMapper.convertValue(data, TrafficFlowObserved.class);
        trafficFlowObserved.setDateObserved(dateObserved);

        trafficFlowObservedRepository.save(trafficFlowObserved);
        log.info("Saved TrafficFlowObserved entity | cameraId: {} | dateObserved: {}",
                trafficFlowObserved.getRefDevice(), trafficFlowObserved.getDateObserved());
    }

    @Override
    public TrafficStaticsResponse getDailyStatics(String refDevice, String date) {
        LocalDate localDate = LocalDate.parse(date);
        ZoneId zoneVN = ZoneId.of("Asia/Ho_Chi_Minh");

        Instant start = localDate.atStartOfDay(zoneVN).toInstant();
        Instant end = localDate.atTime(LocalTime.MAX).atZone(zoneVN).toInstant();


        List<TrafficStaticsResponse.StaticsValue> results = trafficFlowObservedRepository.getHourlyStatics(
                refDevice, start, end
        );

        TreeMap<Instant, TrafficStaticsResponse.StaticsValue> valueMap = new TreeMap<>();
        for (var v : results) {
            Instant hourInstant = v.getHour();
            valueMap.put(hourInstant, v);
        }


        List<TrafficStaticsResponse.StaticsValue> fullList = new ArrayList<>();
        for (int h = 0; h < 24; h++) {

            Instant hourInstant = localDate
                    .atTime(h, 0)
                    .atZone(zoneVN)
                    .toInstant();
            TrafficStaticsResponse.StaticsValue value = valueMap.get(hourInstant);
            if (value == null) {
                value = TrafficStaticsResponse.StaticsValue.builder()
                        .hour(hourInstant)
                        .build();
            }
            fullList.add(value);
        }
        return TrafficStaticsResponse.builder()
                .refDevice(refDevice)
                .dataPoints(fullList)
                .build();

    }

    @Override
    public List<TrafficStaticsResponse> downloadTrafficStatics(Map<String, Object> payload) {
        if (payload == null || payload.get("refDevices") == null || payload.get("date") == null)
            throw new BadRequestException("Missing payload");

        List<String> refDevices = (List<String>) payload.get("refDevices");
        String date = (String) payload.get("date");

        List<TrafficStaticsResponse> staticsResponses = refDevices.stream()
                .map(refDevice -> getDailyStatics(refDevice, date))
                .collect(Collectors.toList());

        return staticsResponses;
    }
}
