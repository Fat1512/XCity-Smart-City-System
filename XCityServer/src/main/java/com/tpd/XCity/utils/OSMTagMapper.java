package com.tpd.XCity.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.tpd.XCity.entity.Building;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.BuildingCategory;
import com.tpd.XCity.entity.Property;

import java.util.*;
import java.util.function.BiConsumer;

public class OSMTagMapper {
    private static final Map<String, BiConsumer<Building, String>> TAG_MAPPING = Map.ofEntries(
            Map.entry("name", (b, v) -> b.setName(new Property<>(v))),
            Map.entry("description", (b, v) -> b.setDescription(new Property<>(v))),
            Map.entry("opening_hours", (b, v) -> b.setOpeningHours(new Property<>(List.of(v)))),

            Map.entry("building", (b, v) -> {
                try {
                    b.setCategory(new Property<>(List.of(BuildingCategory.valueOf(v.toUpperCase()))));
                } catch (IllegalArgumentException ignored) {
                }
            }),
            Map.entry("building:levels", (b, v) -> {
                try {
                    b.setFloorsAboveGround(new Property<>((double) Integer.parseInt(v)));
                } catch (NumberFormatException ignored) {
                }
            }),
            Map.entry("building:levels:underground", (b, v) -> {
                try {
                    b.setFloorsBelowGround(new Property<>((double) Integer.parseInt(v)));
                } catch (NumberFormatException ignored) {
                }
            }),

            Map.entry("addr:street", (b, v) -> ensureAddress(b).getValue().setStreetAddress(v)),
            Map.entry("addr:city", (b, v) -> ensureAddress(b).getValue().setAddressLocality(v)),
            Map.entry("addr:district", (b, v) -> ensureAddress(b).getValue().setAddressRegion(v)),
            Map.entry("addr:postcode", (b, v) -> ensureAddress(b).getValue().setPostalCode(v)),
            Map.entry("addr:housenumber", (b, v) -> ensureAddress(b).getValue().setStreetNr(v))
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

    private static Property<Address> ensureAddress(Building b) {
        if (b.getAddress() == null) b.setAddress(Property.<Address>builder()
                .value(new Address())
                .build());
        return b.getAddress();
    }
}
