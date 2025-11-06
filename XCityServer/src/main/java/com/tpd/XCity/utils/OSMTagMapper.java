package com.tpd.XCity.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.building.Address;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.Property;

import java.util.*;
import java.util.function.BiConsumer;

public class OSMTagMapper {
    private static final Map<String, BiConsumer<Building, String>> TAG_MAPPING = Map.ofEntries(
            Map.entry("name", (b, v) -> b.setName(v)),
            Map.entry("description", (b, v) -> b.setDescription(v)),
            Map.entry("opening_hours", (b, v) -> b.setOpeningHours(List.of(v))),

            Map.entry("building", (b, v) -> {
                try {
                    b.setCategory(List.of(BuildingCategory.valueOf(v.toUpperCase())));
                } catch (IllegalArgumentException ignored) {
                }
            }),
            Map.entry("building:levels", (b, v) -> {
                try {
                    b.setFloorsAboveGround(Double.valueOf(v));
                } catch (NumberFormatException ignored) {
                }
            }),
            Map.entry("building:levels:underground", (b, v) -> {
                try {
                    b.setFloorsBelowGround(Double.valueOf(v));
                } catch (NumberFormatException ignored) {
                }
            }),

            Map.entry("addr:street", (b, v) -> ensureAddress(b).setStreetAddress(v)),
            Map.entry("addr:city", (b, v) -> ensureAddress(b).setAddressLocality(v)),
            Map.entry("addr:district", (b, v) -> ensureAddress(b).setDistrict(v)),
            Map.entry("addr:postcode", (b, v) -> ensureAddress(b).setPostalCode(v)),
            Map.entry("addr:housenumber", (b, v) -> ensureAddress(b).setStreetNr(v))
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
