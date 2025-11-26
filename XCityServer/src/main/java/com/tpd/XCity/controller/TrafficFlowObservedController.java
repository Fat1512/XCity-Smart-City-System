package com.tpd.XCity.controller;

import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;
import com.tpd.XCity.dto.response.TrafficStaticsResponse;
import com.tpd.XCity.service.TrafficFlowObservedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TrafficFlowObservedController {
    private final TrafficFlowObservedService trafficFlowObservedService;

    @PostMapping("/traffic/notify")
    public ResponseEntity<String> receiveNotification(@RequestBody Map<String, Object> payload) {
        trafficFlowObservedService.saveMeasurementSensor(payload);
        return ResponseEntity.ok("Received");
    }

    @GetMapping("/traffic/daily-statics/{cameraId}")
    public ResponseEntity<TrafficStaticsResponse> getMonthlyStatics(
            @PathVariable(value = "cameraId") String cameraId,
            @RequestParam(value = "date") String date
    ) {

        TrafficStaticsResponse responses = trafficFlowObservedService.getDailyStatics(cameraId, date);
        return ResponseEntity.ok(responses);
    }
}
