package com.tpd.XCity.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.BuildingDetailResponse;
import com.tpd.XCity.dto.response.BuildingOverviewResponse;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.building.BuildingCategory;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.mapper.decorator.BuildingMapperDecorator;
import org.mapstruct.*;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
@DecoratedWith(BuildingMapperDecorator.class)
public interface BuildingMapper {
    @Mapping(target = "openingHours", ignore = true)
    BuildingDetailResponse convertToDetailResponse(Building building);

    BuildingOverviewResponse convertToOverviewResponse(Building building);
    @Mapping(target = "openingHours", ignore = true)
    Building convertToEntity(BuildingUpdateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "openingHours", ignore = true)
    void updateBuilding(BuildingUpdateRequest request, @MappingTarget Building building);

    @Named("fromOrion")
    default Building fromOrion(JsonNode json) {
        ObjectMapper mapper = new ObjectMapper();
        Building dto = new Building();
        dto.setId(json.get("id").asText());
        dto.setName(getValue(json, "name"));
        dto.setDescription(getValue(json, "description"));

        dto.setFloorsAboveGround(getDoubleValue(json, "floorsAboveGround"));
        dto.setFloorsBelowGround(getDoubleValue(json, "floorsBelowGround"));

        JsonNode addr = json.path("address").path("value");
        dto.getAddress().setAddressLocality(addr.path("addressLocality").asText(null));
        dto.getAddress().setAddressRegion(addr.path("addressRegion").asText(null));
        dto.getAddress().setStreetAddress(addr.path("streetAddress").asText(null));
        dto.getAddress().setStreetNr(addr.path("streetNr").asText(null));

        JsonNode locNode = json.path("location").path("value");
        dto.setLocation(mapper.convertValue(locNode, Location.class));

        JsonNode categoryNode = json.path("category").path("value");
        List<BuildingCategory> categories = new ArrayList<>();

        if (categoryNode.isArray()) {
            for (JsonNode node : categoryNode) {
                categories.add(BuildingCategory.valueOf(node.asText()));
            }
        } else if (categoryNode.isTextual()) {
            categories.add(BuildingCategory.valueOf(categoryNode.asText()));
        }

        dto.setCategory(categories);
        return dto;
    }

    @Named("toOrion")
    default ObjectNode toOrion(Building dto) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();

        root.put("id", dto.getId());
        root.put("type", "Building");

        // Các field cơ bản
        safeSet(root, "name", mapper, dto.getName());
        safeSet(root, "description", mapper, dto.getDescription());
        safeSet(root, "category", mapper, dto.getCategory());
        safeSet(root, "floorsAboveGround", mapper, dto.getFloorsAboveGround());
        safeSet(root, "floorsBelowGround", mapper, dto.getFloorsBelowGround());

        // Địa chỉ (Address)
        if (dto.getAddress() != null) {
            ObjectNode addrValue = mapper.createObjectNode();
            if (dto.getAddress().getAddressLocality() != null)
                addrValue.put("addressLocality", dto.getAddress().getAddressLocality());
            if (dto.getAddress().getAddressRegion() != null)
                addrValue.put("addressRegion", dto.getAddress().getAddressRegion());
            if (dto.getAddress().getStreetAddress() != null)
                addrValue.put("streetAddress", dto.getAddress().getStreetAddress());
            if (dto.getAddress().getStreetNr() != null)
                addrValue.put("streetNr", dto.getAddress().getStreetNr());

            if (!addrValue.isEmpty()) {
                ObjectNode addr = mapper.createObjectNode();
                addr.put("type", "Property");
                addr.set("value", addrValue);
                root.set("address", addr);
            }
        }

        // Vị trí (GeoProperty)
        if (dto.getLocation() != null) {
            ObjectNode loc = mapper.valueToTree(dto.getLocation());
            if (loc.has("bbox")) {
                JsonNode bbox = loc.get("bbox");
                if (bbox == null || bbox.isNull()) {
                    loc.remove("bbox");
                }
            }
            root.set("location", loc);
        }
        return root;
    }

    private void safeSet(ObjectNode root, String key, ObjectMapper mapper, Object value) {
        if (value != null) {
            ObjectNode node = mapper.createObjectNode();
            node.put("type", "Property");
            node.set("value", mapper.valueToTree(value));
            root.set(key, node);
        }
    }

    private static String getValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asText(null) : null;
    }

    private static Integer getIntValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asInt() : null;
    }

    private static Double getDoubleValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asDouble() : null;
    }
}
