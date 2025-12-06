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
package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.building.GeoJsonType;
import com.tpd.XCity.entity.building.GeoProperty;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.BuildingMapper;
import com.tpd.XCity.repository.BuildingRepository;
import com.tpd.XCity.service.BuildingService;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.AppConstant;
import com.tpd.XCity.utils.Helper;
import com.tpd.XCity.utils.OSMTagMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.APIResponseMessage.SUCCESSFULLY_CREATED;
import static com.tpd.XCity.utils.APIResponseMessage.SUCCESSFULLY_UPDATED;
import static com.tpd.XCity.utils.AppConstant.BUILDING_CONTEXT;

@RequiredArgsConstructor
@Service
@Slf4j
public class BuildingServiceImpl implements BuildingService {
    private final ObjectMapper objectMapper;
    private final BuildingMapper buildingMapper;
    private final BuildingRepository buildingRepository;
    private final OrionService orionService;
    private final RestTemplate restTemplate;

    @Value("${app.overpass-url}")
    private String OVERPASS_URL;

    @Override
    public BuildingDetailResponse getEntitiesById(String id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found building"));

        return buildingMapper.convertToDetailResponse(building);
    }

    @Override
    public MessageResponse updateBuilding(String id, BuildingUpdateRequest request) throws JsonProcessingException {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found building"));
        Building oldBuilding = objectMapper.readValue(objectMapper.writeValueAsString(building), Building.class);

        buildingMapper.updateBuilding(request, building);
        buildingRepository.save(building);

        Map<String, Object> diff = Helper.getChangedFields(oldBuilding, building);

        orionService.patchAttributes(id, diff, BUILDING_CONTEXT);
        return MessageResponse.builder()
                .message(SUCCESSFULLY_UPDATED.name())
                .status(HttpStatus.OK)
                .build();
    }

    @Override
    public MessageResponse createBuilding(BuildingUpdateRequest request) {
        Building building = buildingMapper.convertToEntity(request);
        building.setId(Helper.getURNId(building.getType()));

        orionService.createEntity(buildingMapper.toOrion(building), BUILDING_CONTEXT);

        buildingRepository.save(building);
        return MessageResponse.builder()
                .message(SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public List<BuildingDetailResponse> getBuildingMap() {
        List<BuildingDetailResponse> buildingDetailResponses = buildingRepository.findAll().stream()
                .map(b -> buildingMapper.convertToDetailResponse(b))
                .collect(Collectors.toList());
        return buildingDetailResponses;
    }

    @Override
    public PageResponse<BuildingOverviewResponse> getBuildings(String kw, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Building> pageBuilding = buildingRepository.searchBuilding(kw, pageable);

        List<BuildingOverviewResponse> data = pageBuilding.get()
                .map(p -> buildingMapper.convertToOverviewResponse(p))
                .collect(Collectors.toList());


        return PageResponse.<BuildingOverviewResponse>builder()
                .content(data)
                .last(pageBuilding.isLast())
                .totalPages(pageBuilding.getTotalPages())
                .page(page)
                .size(pageBuilding.getSize())
                .totalElements(pageBuilding.getTotalElements())
                .build();

    }


    @Override
    public void initBuildingFromOverpass() {
        try {
            String query = """
                    [out:json][timeout:60];          
                      (
                        // Công an
                        node["amenity"="police"](10.33,106.36,11.25,107.05);
                        way["amenity"="police"](10.33,106.36,11.25,107.05);
                        relation["amenity"="police"](10.33,106.36,11.25,107.05);
                      
                        // Bệnh viện
                        node["amenity"="hospital"](10.33,106.36,11.25,107.05);
                        way["amenity"="hospital"](10.33,106.36,11.25,107.05);
                        relation["amenity"="hospital"](10.33,106.36,11.25,107.05);
                      
                        // Ủy ban nhân dân
                        node["amenity"="townhall"](10.33,106.36,11.25,107.05);
                        way["amenity"="townhall"](10.33,106.36,11.25,107.05);
                        relation["amenity"="townhall"](10.33,106.36,11.25,107.05);
                      );
                      
                      out center;
                    """;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("data", query);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    OVERPASS_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode elements = root.get("elements");
            if (elements == null) return;

            List<ObjectNode> buildings = new ArrayList<>();
            List<Building> buildingEntities = new ArrayList<>();

            for (JsonNode el : elements) {
                String type = el.get("type").asText();
                if (!List.of("node", "way", "relation").contains(type)) continue;
                Building b = new Building();
                b.setId("urn:ngsi-ld:Building:" + el.get("id").asText());

                JsonNode tags = el.get("tags");
                if (tags.get("name") == null) continue;
                if (tags != null) {
                    OSMTagMapper.applyTags(b, tags);
                }

                Location loc = new Location();
                loc.setType(GeoJsonType.Point);

                if (el.has("lat") && el.has("lon")) {
                    loc.setCoordinates(List.of(el.get("lon").asDouble(), el.get("lat").asDouble()));
                } else if (el.has("center")) {
                    loc.setCoordinates(List.of(el.get("center").get("lon").asDouble(), el.get("center").get("lat").asDouble()));
                }
                b.setLocation(loc);
                Address address = fillAddress(loc);
                if (address == null) continue;

                b.setAddress(address);
                buildingEntities.add(b);
                buildings.add(buildingMapper.toOrion(b));
                log.info("Success add building", b.getId());
            }

            orionService.createEntities(buildings, BUILDING_CONTEXT);
            buildingRepository.saveAll(buildingEntities);
            log.info("Done upload building", buildingEntities.size());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public Address fillAddress(Location loc) {
        if (loc.getCoordinates() == null) return null;
        Object coordsObj = loc.getCoordinates();
        Collection<Double> coordinates;
        List<Double> coordList;
        double lon;
        double lat;
        if (coordsObj instanceof Collection<?> coll && coll.size() >= 2) {
            // Nếu đã là Collection, ép kiểu an toàn
            coordinates = new ArrayList<>();
            Iterator<?> it = coll.iterator();
            coordinates.add(((Number) it.next()).doubleValue());
            coordinates.add(((Number) it.next()).doubleValue());

            coordList = new ArrayList<>(coordinates);
            lon = coordList.get(1);
            lat = coordList.get(0);
        } else {
            return null;
        }

        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f&addressdetails=1",
                    lat, lon
            );

            RestTemplate restTemplate = new RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

            org.springframework.http.ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    JsonNode.class
            );

            JsonNode body = response.getBody();
            if (body != null && body.has("address")) {
                JsonNode addressRes = body.get("address");

                String road = Optional.ofNullable(addressRes.get("road")).map(JsonNode::asText).orElse(null);
                String suburb = Optional.ofNullable(addressRes.get("suburb")).map(JsonNode::asText)
                        .orElse(Optional.ofNullable(addressRes.get("neighbourhood")).map(JsonNode::asText).orElse(null));
                String city = Optional.ofNullable(addressRes.get("city")).map(JsonNode::asText)
                        .orElse(Optional.ofNullable(addressRes.get("town")).map(JsonNode::asText)
                                .orElse(Optional.ofNullable(addressRes.get("village")).map(JsonNode::asText).orElse(null)));
                String state = Optional.ofNullable(addressRes.get("state")).map(JsonNode::asText).orElse(null);
                String country = Optional.ofNullable(addressRes.get("country")).map(JsonNode::asText).orElse(null);


                Address address = Address.builder()
                        .streetAddress(road)
                        .addressLocality(city)
                        .addressCountry(country)
                        .addressLocality(suburb)
                        .build();

                return address;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
