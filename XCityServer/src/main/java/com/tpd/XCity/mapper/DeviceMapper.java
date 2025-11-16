package com.tpd.XCity.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.DeviceLocation;
import com.tpd.XCity.dto.response.DeviceResponse;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.device.Device;
import org.mapstruct.*;

import static com.tpd.XCity.utils.Helper.*;

@Mapper(componentModel = "spring")
public interface DeviceMapper {

    Device convertToEntity(DeviceCreateRequest request);

    DeviceResponse convertToResponse(Device device);
    DeviceLocation convertToDeviceLocation(Device device);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateDevice(DeviceCreateRequest request, @MappingTarget Device device);

    @Named("toOrion")
    default ObjectNode toOrion(Device dto) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();

        root.put("id", dto.getId());
        root.put("type", dto.getType());

        safeSet(root, "name", mapper, dto.getName());
        safeSet(root, "description", mapper, dto.getDescription());
        safeSet(root, "category", mapper, dto.getCategory());
        safeSet(root, "controlledProperty", mapper, dto.getControlledProperty());
        safeSet(root, "provider", mapper, dto.getProvider());
        safeSet(root, "deviceState", mapper, dto.getDeviceState().toString());
        safeSet(root, "dateCreated", mapper, dto.getDateCreated());
        safeSet(root, "controlledProperty", mapper, dto.getControlledProperty());


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
