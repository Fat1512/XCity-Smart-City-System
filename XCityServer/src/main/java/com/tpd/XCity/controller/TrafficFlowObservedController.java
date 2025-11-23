package com.tpd.XCity.controller;

import com.tpd.XCity.service.TrafficFlowObservedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TrafficFlowObservedController {
    private final TrafficFlowObservedService trafficFlowObservedService;

//    @PostMapping("/traffic/notify")
    public ResponseEntity<String> receiveNotification(@RequestBody Map<String, Object> payload) {
        trafficFlowObservedService.saveMeasurementSensor(payload);
        return ResponseEntity.ok("Received");
    }
}
