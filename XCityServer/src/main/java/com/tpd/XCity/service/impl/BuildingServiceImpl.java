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

        orionService.patchAttributes(id, diff);
        return MessageResponse.builder()
                .message(SUCCESSFULLY_UPDATED.name())
                .status(HttpStatus.OK)
                .build();
    }

    @Override
    public MessageResponse createBuilding(BuildingUpdateRequest request) {
        Building building = buildingMapper.convertToEntity(request);
        building.setId(Helper.getURNId(building.getType()));

        orionService.createEntity(buildingMapper.toOrion(building));

        buildingRepository.save(building);
        return MessageResponse.builder()
                .message(SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.CREATED)
                .build();
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
                    [out:json][timeout:180];
                    area["name"="Quận 10"]->.searchArea;
                                        
                    (
                      node["building"](area.searchArea);
                      way["building"](area.searchArea);
                      relation["building"](area.searchArea);
                    );
                    out tags geom 50;
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

            orionService.createEntities(buildings);
            buildingRepository.saveAll(buildingEntities);
            System.out.println("Done: Uploaded " + buildings.size() + " buildings to Orion-LD.");
        } catch (Exception e) {
            e.printStackTrace();
        }

    }
}
