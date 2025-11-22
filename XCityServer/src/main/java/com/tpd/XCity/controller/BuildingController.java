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

import static com.tpd.XCity.utils.AppConstant.*;

@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
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
