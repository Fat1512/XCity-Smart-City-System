package com.tpd.XCity.controller;

import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.tpd.XCity.utils.AppConstant.PAGE_DEFAULT;
import static com.tpd.XCity.utils.AppConstant.PAGE_SIZE;

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

    @PutMapping("/alert/{id}/solved")
    public ResponseEntity<MessageResponse> markSolved(@PathVariable String id) {
        MessageResponse response = alertService.markSolved(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/alert/solved")
    public ResponseEntity<PageResponse> getAlertNotSolved(
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size
    ) {

        PageResponse pageResponse = alertService.getAlertNotSolved(Integer.parseInt(page), Integer.parseInt(size));
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/alert/statics")
    public ResponseEntity<AlertStaticsResponse> getStatics(
            @RequestParam("type") String type
    ) {

        AlertStaticsResponse responses = alertService.getStaticsAlert(type);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/alert/download")
    public ResponseEntity<List<AlertResponse>> downloadData(
            @RequestParam("type") String type
    ) {

        List<AlertResponse> responses = alertService.getDataForDownload(type);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/alert-notification")
    public ResponseEntity<PageResponse> getAlertNotification(
            @RequestParam(value = "solved", required = false) String solved,
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size
    ) {

        PageResponse pageResponse = alertService.getAlertOverview(solved, Integer.parseInt(page), Integer.parseInt(size));
        return ResponseEntity.ok(pageResponse);
    }
}
