package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.entity.building.GeoJsonType;
import com.tpd.XCity.entity.building.GeoProperty;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.BuildingMapper;
import com.tpd.XCity.repository.BuildingRepository;
import com.tpd.XCity.service.BuildingService;
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

@RequiredArgsConstructor
@Service
@Slf4j
public class BuildingServiceImpl implements BuildingService {
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final BuildingMapper buildingMapper;
    private final BuildingRepository buildingRepository;

    @Value("${app.orion-url}")
    private String ORION_URL;
    @Value("${app.overpass-url}")
    private String OVERPASS_URL;
    private final String BUILDING_TYPE = "https://smartdatamodels.org/dataModel.Building/Building";

    private HttpHeaders createJsonLdHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Link",
                "<https://smart-data-models.github.io/dataModel.Building/context.jsonld>; " +
                        "rel=\"http://www.w3.org/ns/json-ld#context\"; type=\"application/ld+json\"");
        return headers;
    }

    public void patchAttributes(String entityId, Map<String, Object> attrs) {
        if (attrs == null || attrs.isEmpty()) return;

        Map<String, Object> body = attrs.entrySet().stream().collect(
                java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Map.of("type", "Property", "value", e.getValue())
                )
        );

        String url = String.format("%s/%s/attrs", ORION_URL, entityId);


        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, createJsonLdHeaders());
        ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Void.class);


        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Failed to update Orion-LD entity " + entityId + ": " + response.getStatusCode());
        }
    }

    @Override
    public JsonLdWrapperResponse<Building> getEntitiesByType() {
        try {
            String url = String.format("%s?type=%s", ORION_URL, BUILDING_TYPE);
            HttpEntity<String> req = new HttpEntity<>(createJsonLdHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, req, String.class);

            JsonLdWrapperResponse jsonLdWrapperResponse = JsonLdWrapperResponse.builder()
                    .context(List.of(AppConstant.DEFAULT_CONTEXT))
                    .data(objectMapper.readTree(response.getBody()))
                    .build();
            log.info("Get entities: {}", BUILDING_TYPE);
            return jsonLdWrapperResponse;
        } catch (Exception ex) {
            log.warn("Failed to get entities {}: {}", ex.getMessage());
            throw new RuntimeException(ex);
        }
    }

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

        patchAttributes(id, diff);
        return MessageResponse.builder()
                .message(SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.OK)
                .build();
    }

    @Override
    public PageResponse<BuildingOverviewResponse> getBuildings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Building> pageBuilding = buildingRepository.findAll(pageable);

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
    public void createBuilding(Building building) {
        try {
            HttpEntity<String> req = new HttpEntity<>(objectMapper.writeValueAsString(building), createJsonLdHeaders());
            restTemplate.exchange(ORION_URL, HttpMethod.POST, req, String.class);
            log.info("Created building: {}", building.getId());
        } catch (Exception ex) {
            log.warn("Failed to create {}: {}", building.getId(), ex.getMessage());
        }
    }

    @Override
    public void createBuildings(List<ObjectNode> buildings) {
        if (buildings == null || buildings.isEmpty()) {
            log.info("No buildings to send to Orion-LD.");
            return;
        }

        HttpHeaders headers = createJsonLdHeaders();

        try {
            String batchUrl = ORION_URL.replace("/entities", "/entityOperations/create");

            String json = objectMapper.writeValueAsString(buildings);
            HttpEntity<String> req = new HttpEntity<>(json, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    batchUrl,
                    HttpMethod.POST,
                    req,
                    String.class
            );

            log.info("Batch upload {} buildings — response: {}", response.getBody(), response.getStatusCode());
        } catch (Exception batchEx) {
            log.warn("Batch upload failed: {} → fallback to single create", batchEx.getMessage());

        }
    }

    @Override
    public void initBuildingFromOverpass() {
        try {
            String query = """
                    [out:json][timeout:180];
                    area["name"="Quận 10"]->.searchArea;
                                        
                    (
                      node["building"](area.searchArea);
                      way["building"](area.searchArea);
                      relation["building"](area.searchArea);
                    );
                    out tags geom 10;
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
                if (tags != null) {
                    OSMTagMapper.applyTags(b, tags);
                }

                Location loc = new Location();
                if (el.has("lat") && el.has("lon")) {
                    loc.setCoordinates(List.of(el.get("lon").asDouble(), el.get("lat").asDouble()));
                } else if (el.has("geometry")) {
                    JsonNode geom = el.get("geometry");

                    if (geom.size() > 0) {
                        List<List<Double>> polygon = new ArrayList<>();
                        for (JsonNode point : geom) {
                            if (point.has("lat") && point.has("lon")) {
                                polygon.add(List.of(point.get("lon").asDouble(), point.get("lat").asDouble()));
                            }
                        }

                        loc.setType(GeoJsonType.Polygon);
                        loc.setCoordinates(List.of(polygon));
                    }
                }
                b.setLocation(loc);

                buildingEntities.add(b);
                buildings.add(buildingMapper.toOrion(b));
            }

            this.createBuildings(buildings);
            buildingRepository.saveAll(buildingEntities);
            System.out.println("Done: Uploaded " + buildings.size() + " buildings to Orion-LD.");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
