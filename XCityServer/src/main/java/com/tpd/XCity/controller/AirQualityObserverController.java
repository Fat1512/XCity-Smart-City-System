package com.tpd.XCity.controller;

import com.tpd.XCity.service.AirQualityObservedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
public class AirQualityObserverController {

    private final AirQualityObservedService airQualityObservedService;

    @PostMapping("/air/notify")
    public ResponseEntity<String> receiveNotification(@RequestBody Map<String, Object> payload) {
        airQualityObservedService.saveMeasurementSensor(payload);
        return ResponseEntity.ok("Received");
    }
}
