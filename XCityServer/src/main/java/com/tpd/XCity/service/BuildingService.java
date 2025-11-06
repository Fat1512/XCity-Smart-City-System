package com.tpd.XCity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.building.Building;

import java.util.List;

public interface BuildingService {
    JsonLdWrapperResponse<Building> getEntitiesByType();

    BuildingDetailResponse getEntitiesById(String id);

    MessageResponse updateBuilding(String id, BuildingUpdateRequest request) throws JsonProcessingException;

    PageResponse<BuildingOverviewResponse> getBuildings(int page, int size);

    void createBuilding(Building building) throws JsonProcessingException;

    void createBuildings(List<ObjectNode> building) throws JsonProcessingException;

    void initBuildingFromOverpass();
}
