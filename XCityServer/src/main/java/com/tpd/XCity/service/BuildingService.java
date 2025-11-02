package com.tpd.XCity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.entity.Building;

import java.util.List;

public interface BuildingService {
    JsonLdWrapperResponse<Building> getEntitiesByType();

    void createBuilding(Building building) throws JsonProcessingException;

    void createBuildings(List<Building> building) throws JsonProcessingException;

    void initBuildingFromOverpass();
}
