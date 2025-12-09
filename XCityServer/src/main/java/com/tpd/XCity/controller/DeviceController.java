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

import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.tpd.XCity.utils.AppConstant.PAGE_DEFAULT;
import static com.tpd.XCity.utils.AppConstant.PAGE_SIZE;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;

    @PostMapping("/device")
    public ResponseEntity<MessageResponse> createDevice(@RequestBody DeviceCreateRequest request) {
        MessageResponse response = deviceService.createDevice(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/device/{id}")
    public ResponseEntity<MessageResponse> updateDevice(@PathVariable String id,
                                                        @RequestBody DeviceCreateRequest request) {
        MessageResponse response = deviceService.updateDevice(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/device/{id}")
    public ResponseEntity<DeviceResponse> getDevice(@PathVariable String id) {
        DeviceResponse pageResponse = deviceService.getDeviceById(id);
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/devices-aq")
    public ResponseEntity<List<DeviceMapWithAQResponse>> getAllDeviceWithAQ() {
        List<DeviceMapWithAQResponse> pageResponse = deviceService.getDeviceMap();
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/devices-map")
    public ResponseEntity<List<DeviceLocation>> getAllDevice() {
        List<DeviceLocation> pageResponse = deviceService.getDevices();
        return ResponseEntity.ok(pageResponse);
    }

    @PostMapping("/device/{id}/start")
    public ResponseEntity<MessageResponse> startSensor(@PathVariable String id) {
        MessageResponse pageResponse = deviceService.startSensor(id);
        return ResponseEntity.ok(pageResponse);
    }

    @PostMapping("/device/{id}/stop")
    public ResponseEntity<MessageResponse> stopSensor(@PathVariable String id) {
        MessageResponse pageResponse = deviceService.stopSensor(id);
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/devices")
    public ResponseEntity<PageResponse> getBuildings(
            @RequestParam(value = "kw", defaultValue = "", required = false) String kw,
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size) {
        PageResponse pageResponse = deviceService.getDevices(kw, Integer.parseInt(page), Integer.parseInt(size));
        return ResponseEntity.ok(pageResponse);
    }
}
