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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.BuildingDetailResponse;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.dto.response.PageResponse;
import com.tpd.XCity.service.BuildingService;
import com.tpd.XCity.service.OrionService;
import lombok.RequiredArgsConstructor;
import org.mapstruct.ap.internal.util.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.tpd.XCity.utils.AppConstant.*;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
public class BuildingController {
    private final BuildingService buildingService;
    private final OrionService orionService;

    @GetMapping("/buildings")
    public ResponseEntity<JsonLdWrapperResponse> getBuildings() {
        JsonLdWrapperResponse response = orionService.getEntitiesByType(BUILDING_TYPE, BUILDING_CONTEXT);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/building/{id}")
    public ResponseEntity<BuildingDetailResponse> getBuilding(@PathVariable("id") String id) {
        BuildingDetailResponse response = buildingService.getEntitiesById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/building-map")
    public ResponseEntity<List<BuildingDetailResponse>> getBuildingMap(
            @RequestParam(value = "kw", defaultValue = "", required = false) String kw,
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size) {
        List<BuildingDetailResponse> pageResponse = buildingService.getBuildingMap();
        return ResponseEntity.ok(pageResponse);
    }

    @GetMapping("/s-buildings")
    public ResponseEntity<PageResponse> getBuildings(
            @RequestParam(value = "kw", defaultValue = "", required = false) String kw,
            @RequestParam(value = "page", defaultValue = PAGE_DEFAULT) String page,
            @RequestParam(value = "size", defaultValue = PAGE_SIZE) String size) {
        PageResponse pageResponse = buildingService.getBuildings(kw, Integer.parseInt(page), Integer.parseInt(size));
        return ResponseEntity.ok(pageResponse);
    }

    @PutMapping("/building/{id}")
    public ResponseEntity<MessageResponse> updateBuilding(@PathVariable("id") String id, @RequestBody BuildingUpdateRequest request) throws JsonProcessingException {
        MessageResponse response = buildingService.updateBuilding(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/building")
    public ResponseEntity<MessageResponse> createBuilding(@RequestBody BuildingUpdateRequest request) throws JsonProcessingException {
        MessageResponse response = buildingService.createBuilding(request);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/building/init")
    public ResponseEntity<String> initBuilding() {
        buildingService.initBuildingFromOverpass();
        return ResponseEntity.ok("Success");
    }
}
