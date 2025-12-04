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
package com.tpd.XCity.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.CameraCreateRequest;
import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.CameraOverviewResponse;
import com.tpd.XCity.dto.response.CameraResponse;
import com.tpd.XCity.entity.device.Camera;
import com.tpd.XCity.entity.device.Device;
import org.mapstruct.*;

import static com.tpd.XCity.utils.Helper.safeSet;

@Mapper(componentModel = "spring")
public interface CameraMapper {

    Camera convertToEntity(CameraCreateRequest request);

    CameraResponse convertToResponse(Camera camera);

    CameraOverviewResponse convertToOverviewResponse(Camera camera);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCamera(CameraCreateRequest request, @MappingTarget Camera camera);

    @Named("toOrion")
    default ObjectNode toOrion(Camera dto) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode root = mapper.createObjectNode();

        root.put("id", dto.getId());
        root.put("type", dto.getType());

        safeSet(root, "cameraName", mapper, dto.getCameraName());
        safeSet(root, "description", mapper, dto.getDescription());
        safeSet(root, "provider", mapper, dto.getDataProvider());
        safeSet(root, "dateCreated", mapper, dto.getDateCreated());
        safeSet(root, "dateModified", mapper, dto.getDateModified());
        safeSet(root, "cameraUsage", mapper, dto.getCameraUsage());
        safeSet(root, "on", mapper, dto.isOn());

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
