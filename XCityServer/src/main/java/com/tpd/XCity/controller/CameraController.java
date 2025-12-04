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

import com.tpd.XCity.dto.request.CameraCreateRequest;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.CameraOverviewResponse;
import com.tpd.XCity.dto.response.CameraResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.dto.response.PageResponse;
import com.tpd.XCity.service.CameraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.tpd.XCity.utils.AppConstant.PAGE_DEFAULT;
import static com.tpd.XCity.utils.AppConstant.PAGE_SIZE;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
public class CameraController {
    private final CameraService cameraService;

    @GetMapping("/camera/{id}")
    public ResponseEntity<CameraResponse> getCamera(@PathVariable String id) {
        CameraResponse response = cameraService.getCamera(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/camera")
    public ResponseEntity<MessageResponse> createCamera(@RequestBody CameraCreateRequest request) {
        MessageResponse response = cameraService.createCamera(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/camera/{id}")
    public ResponseEntity<MessageResponse> updateCamera(@PathVariable String id, @RequestBody CameraCreateRequest request) {
        MessageResponse response = cameraService.updateCamera(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all-camera")
    public ResponseEntity<List<CameraOverviewResponse>> getCameras() {
        List<CameraOverviewResponse> cameraOverviewResponses = cameraService.getAllCamera();
        return ResponseEntity.ok(cameraOverviewResponses);
    }

    @GetMapping("/cameras")
    public ResponseEntity<PageResponse> searchCamera(
            @RequestParam(value = "kw", defaultValue = "", required = false) String kw,
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size) {
        PageResponse pageResponse = cameraService.searchCamera(kw, Integer.parseInt(page), Integer.parseInt(size));
        return ResponseEntity.ok(pageResponse);
    }


}
