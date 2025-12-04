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
public class TrafficFlowObservedController {
    private final TrafficFlowObservedService trafficFlowObservedService;

    @PostMapping("/traffic/notify")
    public ResponseEntity<String> receiveNotification(@RequestBody Map<String, Object> payload) {
        trafficFlowObservedService.saveMeasurementSensor(payload);
        return ResponseEntity.ok("Received");
    }

    @PostMapping("/traffic/download-statics/")
    public ResponseEntity<List<TrafficStaticsResponse>> downloadTraffic(@RequestBody Map<String, Object> payload) {
        List<TrafficStaticsResponse> responses = trafficFlowObservedService.downloadTrafficStatics(payload);
        return ResponseEntity.ok(responses);
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
