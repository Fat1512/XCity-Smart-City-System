package com.tpd.XCity.controller;

import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BuildingController {
    private final BuildingService buildingService;

    @GetMapping("/buildings")
    public ResponseEntity<JsonLdWrapperResponse> getBuildings() {
        JsonLdWrapperResponse response = buildingService.getEntitiesByType();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/building/{id}")
    public ResponseEntity<JsonLdWrapperResponse> getBuilding(@PathVariable("id") String id) {
        JsonLdWrapperResponse response = buildingService.getEntitiesById(id);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/building/init")
    public ResponseEntity<String> initBuilding() {
        buildingService.initBuildingFromOverpass();
        return ResponseEntity.ok("Success");
    }
}
