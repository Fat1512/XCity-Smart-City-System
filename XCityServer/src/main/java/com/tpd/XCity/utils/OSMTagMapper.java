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
package com.tpd.XCity.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.BuildingCategory;

import java.util.*;
import java.util.function.BiConsumer;

public class OSMTagMapper {
    private static final Map<String, BiConsumer<Building, String>> TAG_MAPPING = Map.ofEntries(
            Map.entry("name", (b, v) -> b.setName(v)),
            Map.entry("description", (b, v) -> b.setDescription(v)),
            Map.entry("amenity", (b, v) -> {
                try {
                    b.setCategory(List.of(BuildingCategory.valueOf(v.toUpperCase())));
                } catch (IllegalArgumentException ignored) {
                    b.setCategory(List.of(BuildingCategory.CIVIC));
                }
            })

//            Map.entry("addr:street", (b, v) -> ensureAddress(b).setStreetAddress(v)),
//            Map.entry("addr:city", (b, v) -> ensureAddress(b).setAddressRegion(v)),
//            Map.entry("addr:subdistrict", (b, v) -> ensureAddress(b).setAddressLocality(v))
    );

    public static void applyTags(Building building, JsonNode tagsNode) {
        if (building == null || tagsNode == null || !tagsNode.isObject()) return;

        tagsNode.fields().forEachRemaining(entry -> {
            String key = entry.getKey();
            String value = entry.getValue().asText();

            BiConsumer<Building, String> setter = TAG_MAPPING.get(key);
            if (setter != null) {
                setter.accept(building, value);
            }
        });

    }

    private static Address ensureAddress(Building b) {
        if (b.getAddress() == null) b.setAddress(new Address());
        return b.getAddress();
    }
}
