package com.tpd.XCity.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.entity.building.Building;

import java.util.List;
import java.util.Map;

public interface OrionService {
    JsonLdWrapperResponse getEntitiesByType(String type, String context);

    void createEntity(ObjectNode entity, String context);

    void createEntities(List<ObjectNode> entities, String context);

    void patchAttributes(String id, Map<String, Object> diff, String context);
}
