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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.entity.device.Device;
import com.tpd.XCity.entity.device.DeviceStatus;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.DeviceMapper;
import com.tpd.XCity.repository.AirQualityObservedRepository;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.service.DeviceService;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.APIResponseMessage;
import com.tpd.XCity.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.AppConstant.DEVICE_CONTEXT;
import static com.tpd.XCity.utils.Helper.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final AirQualityObservedRepository airQualityObservedRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final OrionService orionService;
    private final DeviceMapper deviceMapper;

    @Value("${app.sensor-url}")
    private String SENSOR_URL;
    @Value("${app.iot-agent-url}")
    private String IOT_AGENT_URL;


    @Override
    public MessageResponse createDevice(DeviceCreateRequest request) {
        Device device = deviceMapper.convertToEntity(request);
        device.setId(getURNId(device.getType()));
        device.setDeviceState(DeviceStatus.INACTIVE);
        orionService.createEntity(deviceMapper.toOrion(device), DEVICE_CONTEXT);

        sendDevice(getIdFromURN(device.getId()), device.getId());
        deviceRepository.save(device);

        return MessageResponse.builder()
                .message("Successfully create device")
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public List<DeviceMapWithAQResponse> getDeviceMap() {
        List<Device> devices = deviceRepository.findAll();
        List<DeviceMapWithAQResponse> deviceMapWithAQResponses = new ArrayList<>();
        for (Device device : devices) {
            DeviceMapWithAQResponse deviceMapWithAQResponse = deviceMapper.convertToDeviceMapWithAQ(device);

            AirQualityObserved airQualityObserved = airQualityObservedRepository
                    .findFirstByRefDeviceOrderByDateObservedDesc(device.getId())
                    .orElse(new AirQualityObserved());

            deviceMapWithAQResponse.setAirQualityLatest(DeviceMapWithAQResponse.AirQualityLatest.builder()
                    .so2(airQualityObserved.getSo2())
                    .co2(airQualityObserved.getCo2())
                    .temperature(airQualityObserved.getTemperature())
                    .o3(airQualityObserved.getO3())
                    .relativeHumidity(airQualityObserved.getRelativeHumidity())
                    .pm10(airQualityObserved.getPm10())
                    .pm1(airQualityObserved.getPm1())
                    .pm25(airQualityObserved.getPm25())
                    .id(airQualityObserved.getId())
                    .dateObserved(airQualityObserved.getDateObserved())
                    .build());

            deviceMapWithAQResponses.add(deviceMapWithAQResponse);
        }
        return deviceMapWithAQResponses;

    }

    @Override
    public MessageResponse startSensor(String id) {
        try {
            String url = SENSOR_URL + "/start";

            Device device = deviceRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Map<String, Object> body = Map.of("sensorId", getIdFromURN(device.getId()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            device.setDeviceState(DeviceStatus.ACTIVE);
            orionService.patchAttributes(device.getId(), Map.of("deviceState", DeviceStatus.ACTIVE), DEVICE_CONTEXT);

            deviceRepository.save(device);
            return MessageResponse.builder()
                    .status(HttpStatus.OK)
                    .message("Successfully start sensor")
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse stopSensor(String id) {
        try {
            String url = SENSOR_URL + "/stop";
            Device device = deviceRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Map<String, Object> body = Map.of("sensorId", getIdFromURN(device.getId()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            device.setDeviceState(DeviceStatus.INACTIVE);
            orionService.patchAttributes(device.getId(), Map.of("deviceState", DeviceStatus.INACTIVE), DEVICE_CONTEXT);

            deviceRepository.save(device);
            return MessageResponse.builder()
                    .status(HttpStatus.OK)
                    .message("Successfully stop sensor")
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse updateDevice(String deviceId, DeviceCreateRequest request) {
        try {
            Device device = deviceRepository.findById(deviceId)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Device oldDevice = objectMapper.readValue(objectMapper.writeValueAsString(device), Device.class);

            deviceMapper.updateDevice(request, device);

            Map<String, Object> diff = Helper.getChangedFields(oldDevice, device);
            orionService.patchAttributes(deviceId, diff, DEVICE_CONTEXT);

            deviceRepository.save(device);
            return MessageResponse.builder()
                    .message(APIResponseMessage.SUCCESSFULLY_UPDATED.name())
                    .status(HttpStatus.OK)
                    .data(Map.of("id", deviceId))
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public PageResponse<DeviceResponse> getDevices(String kw, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Device> pageDevice = deviceRepository.searchDevice(kw, pageable);

        List<DeviceResponse> data = pageDevice.get()
                .map(p -> deviceMapper.convertToResponse(p))
                .collect(Collectors.toList());


        return PageResponse.<DeviceResponse>builder()
                .content(data)
                .last(pageDevice.isLast())
                .totalPages(pageDevice.getTotalPages())
                .page(page)
                .size(pageDevice.getSize())
                .totalElements(pageDevice.getTotalElements())
                .build();
    }

    @Override
    public List<DeviceLocation> getDevices() {
        List<Device> devices = deviceRepository.findAll();
        List<DeviceLocation> data = devices.stream()
                .map(p -> deviceMapper.convertToDeviceLocation(p))
                .collect(Collectors.toList());
        return data;
    }

    @Override
    public DeviceResponse getDeviceById(String id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));

        return deviceMapper.convertToResponse(device);
    }

    public String sendDevice(String deviceId, String entityName) {
        try {
            String url = IOT_AGENT_URL + "/devices";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Fiware-Service", "openiot");
            headers.set("Fiware-ServicePath", "/");

            Map<String, Object> device = getStringObjectMap(deviceId, entityName);

            Map<String, Object> body = Map.of("devices", List.of(device));

            String jsonBody = objectMapper.writeValueAsString(body);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send device", e);
        }
    }


    private Map<String, Object> getStringObjectMap(String deviceId, String entityName) {
        Map<String, Object> pm25 = Map.of("object_id", "pm25", "name", "https://smartdatamodels.org/dataModel.Environment/pm25", "type", "Number");
        Map<String, Object> pm1 = Map.of("object_id", "pm1", "name", "https://smartdatamodels.org/dataModel.Environment/pm1", "type", "Number");
        Map<String, Object> o3 = Map.of("object_id", "o3", "name", "https://smartdatamodels.org/dataModel.Environment/o3", "type", "Number");
        Map<String, Object> co2 = Map.of("object_id", "co2", "name", "https://smartdatamodels.org/dataModel.Environment/co2", "type", "Number");
        Map<String, Object> temperature = Map.of("object_id", "temperature", "name", "https://smartdatamodels.org/dataModel.Environment/temperature", "type", "Number");
        Map<String, Object> refDevice = Map.of("object_id", "refDevice", "name", "https://smartdatamodels.org/dataModel.Environment/refDevice", "type", "Object");
        Map<String, Object> dateObserved = Map.of("object_id", "dateObserved", "name", "https://smartdatamodels.org/dateObserved", "type", "Object");
        // Device Map
        Map<String, Object> device = Map.of(
                "device_id", deviceId,
                "entity_name", entityName,
                "entity_type", "https://smartdatamodels.org/dataModel.Environment/AirQualityObserved",
                "transport", "MQTT",
                "apikey", "air",
                "attributes", List.of(pm25, pm1, o3, co2, temperature, refDevice, dateObserved)
        );
        return device;
    }
}