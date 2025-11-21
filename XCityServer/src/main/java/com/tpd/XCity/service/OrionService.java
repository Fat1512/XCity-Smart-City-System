package com.tpd.XCity.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.entity.building.Building;

import java.util.List;
import java.util.Map;

public interface OrionService {
    JsonLdWrapperResponse getEntitiesByType(String type);

    void createEntity(ObjectNode entity);

    void createEntities(List<ObjectNode> entities);

    void patchAttributes(String id, Map<String, Object> diff);
}
