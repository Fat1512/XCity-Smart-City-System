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
