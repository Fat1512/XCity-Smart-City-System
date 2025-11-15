package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.request.DeviceIoTAgent;
import com.tpd.XCity.dto.response.BuildingOverviewResponse;
import com.tpd.XCity.dto.response.DeviceResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.dto.response.PageResponse;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.device.Device;
import com.tpd.XCity.entity.device.DeviceStatus;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.DeviceMapper;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.service.DeviceService;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.Helper.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceServiceImpl implements DeviceService {
    private final DeviceRepository deviceRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final OrionService orionService;
    private final DeviceMapper deviceMapper;

    @Override
    public MessageResponse createDevice(DeviceCreateRequest request) {
        Device device = deviceMapper.convertToEntity(request);
        device.setId(getURNId(device.getType()));
        device.setDeviceState(DeviceStatus.INACTIVE);
        orionService.createEntity(deviceMapper.toOrion(device));

        sendDevice(getIdFromURN(device.getId()), device.getId());
        deviceRepository.save(device);

        return MessageResponse.builder()
                .message("Successfully create device")
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public MessageResponse startSensor(String id) {
        try {
            String url = "http://127.0.0.1:5000/sensor/start";
            Device device = deviceRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Map<String, Object> body = Map.of("sensorId", getIdFromURN(device.getId()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            device.setDeviceState(DeviceStatus.ACTIVE);
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
            String url = "http://127.0.0.1:5000/sensor/stop";
            Device device = deviceRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Map<String, Object> body = Map.of("sensorId", getIdFromURN(device.getId()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String jsonBody = objectMapper.writeValueAsString(body);
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            device.setDeviceState(DeviceStatus.ACTIVE);
            return MessageResponse.builder()
                    .status(HttpStatus.OK)
                    .message("Successfully stop sensor")
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
    public DeviceResponse getDeviceById(String id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));

        return deviceMapper.convertToResponse(device);
    }

    public String sendDevice(String deviceId, String entityName) {
        try {
            String url = "http://localhost:4041/iot/devices";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Fiware-Service", "openiot");
            headers.set("Fiware-ServicePath", "/");

            Map<String, Object> pm25 = Map.of("object_id", "pm25", "name", "https://smartdatamodels.org/pm25", "type", "Number");
            Map<String, Object> pm1 = Map.of("object_id", "pm1", "name", "https://smartdatamodels.org/pm1", "type", "Number");
            Map<String, Object> o3 = Map.of("object_id", "o3", "name", "https://smartdatamodels.org/o3", "type", "Number");
            Map<String, Object> co2 = Map.of("object_id", "co2", "name", "https://smartdatamodels.org/co2", "type", "Number");
            Map<String, Object> temperature = Map.of("object_id", "temperature", "name", "https://smartdatamodels.org/temperature", "type", "Number");
            Map<String, Object> refDevice = Map.of("object_id", "ref_device", "name", "https://smartdatamodels.org/ref_device", "type", "Number");
            // Device Map
            Map<String, Object> device = Map.of(
                    "device_id", deviceId,
                    "entity_name", entityName,
                    "entity_type", "https://smartdatamodels.org/dataModel.Environment/AirQualityObserved",
                    "transport", "MQTT",
                    "apikey", "air",
                    "attributes", List.of(pm25, pm1, o3, co2, temperature, refDevice)
            );

            // Body Map
            Map<String, Object> body = Map.of("devices", List.of(device));

            // Serialize Map thành JSON String
            String jsonBody = objectMapper.writeValueAsString(body);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send device", e);
        }
    }


}

