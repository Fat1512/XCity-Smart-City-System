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

import com.tpd.XCity.dto.response.AirQualityDailyStatics;
import com.tpd.XCity.dto.response.AirQualityMonthlyStatics;
import com.tpd.XCity.service.AirQualityObservedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.tpd.XCity.utils.AppConstant.PAGE_DEFAULT;
import static com.tpd.XCity.utils.AppConstant.PAGE_SIZE;

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

    @GetMapping("/air/monthly-statics")
    public ResponseEntity<AirQualityMonthlyStatics> getMonthlyStatics(
            @RequestParam(value = "sensorId") String sensorId,
            @RequestParam(value = "year") String year,
            @RequestParam(value = "month") String month
    ) {

        AirQualityMonthlyStatics airQualityMonthlyStatics = airQualityObservedService.getStatics(sensorId
                , Integer.parseInt(year), Integer.parseInt(month));
        return ResponseEntity.ok(airQualityMonthlyStatics);
    }

    @GetMapping("/air/daily-statics")
    public ResponseEntity<AirQualityDailyStatics> getDailyStatics(
            @RequestParam(value = "sensorId") String sensorId,
            @RequestParam(value = "date") String date

    ) {

        AirQualityDailyStatics airQualityMonthlyStatics = airQualityObservedService.getStatics(sensorId, date);
        return ResponseEntity.ok(airQualityMonthlyStatics);
    }
}
