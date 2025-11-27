package com.tpd.XCity.controller;

import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.AlertResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {
    private final AlertService alertService;

    @PostMapping("/alert")
    public ResponseEntity<MessageResponse> createAlert(@RequestBody AlertCreateRequest request) {
        MessageResponse response = alertService.createAlert(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponse>> getAllAlert() {
        List<AlertResponse> response = alertService.getAlerts();
        return ResponseEntity.ok(response);
    }
}
