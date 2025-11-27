package com.tpd.XCity.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.response.AlertResponse;
import com.tpd.XCity.entity.alert.Alert;
import com.tpd.XCity.entity.device.Camera;
import com.tpd.XCity.mapper.decorator.BuildingMapperDecorator;
import org.mapstruct.DecoratedWith;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import static com.tpd.XCity.utils.Helper.safeSet;

@Mapper(componentModel = "spring")
public interface AlertMapper {

    @Mapping(target = "type", constant = "Alert")
    Alert convertToEntity(AlertCreateRequest alertCreateRequest);

    AlertResponse convertToResponse(Alert alert);

    default ObjectNode toOrion(Alert dto) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        ObjectNode root = mapper.createObjectNode();

        root.put("id", dto.getId());
        root.put("type", dto.getType());

        safeSet(root, "name", mapper, dto.getName());
        safeSet(root, "description", mapper, dto.getDescription());
        safeSet(root, "category", mapper, dto.getCategory());
        safeSet(root, "subCategory", mapper, dto.getSubCategory());
        safeSet(root, "alertSource", mapper, dto.getAlertSource());
        safeSet(root, "dataProvider", mapper, dto.getDataProvider());

        safeSet(root, "dateCreated", mapper, dto.getDateCreated());
        safeSet(root, "dateModified", mapper, dto.getDateModified());

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
}
