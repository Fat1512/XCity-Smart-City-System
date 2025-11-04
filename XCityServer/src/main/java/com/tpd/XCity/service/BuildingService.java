package com.tpd.XCity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.entity.building.Building;

import java.util.List;

public interface BuildingService {
    JsonLdWrapperResponse<Building> getEntitiesByType();

    JsonLdWrapperResponse<Building> getEntitiesById(String id);

    void createBuilding(Building building) throws JsonProcessingException;

    void createBuildings(List<ObjectNode> building) throws JsonProcessingException;

    void initBuildingFromOverpass();
}
