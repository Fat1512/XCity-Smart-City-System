package com.tpd.XCity.controller;

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
@CrossOrigin(origins = "http://localhost:5173")
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

        AirQualityMonthlyStatics airQualityMonthlyStatics = airQualityObservedService.getDailyStats(sensorId
                , Integer.parseInt(year), Integer.parseInt(month));
        return ResponseEntity.ok(airQualityMonthlyStatics);
    }
}
