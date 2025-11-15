package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tpd.XCity.dto.response.JsonLdWrapperResponse;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.AppConstant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class OrionServiceImpl implements OrionService {
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    @Value("${app.orion-url}")
    private String ORION_URL;

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
    public JsonLdWrapperResponse getEntitiesByType(String type) {
        try {
            String url = String.format("%s?type=%s", ORION_URL, type);
            HttpEntity<String> req = new HttpEntity<>(createJsonLdHeaders());
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, req, String.class);

            JsonLdWrapperResponse jsonLdWrapperResponse = JsonLdWrapperResponse.builder()
                    .context(List.of(AppConstant.DEFAULT_CONTEXT))
                    .data(objectMapper.readTree(response.getBody()))
                    .build();
            log.info("Get entities: {}", type);
            return jsonLdWrapperResponse;
        } catch (Exception ex) {
            log.warn("Failed to get entities {}: {}", ex.getMessage());
            throw new RuntimeException(ex);
        }
    }

    @Override
    public void createEntity(ObjectNode entity) {
        try {
            HttpEntity<String> req = new HttpEntity<>(objectMapper.writeValueAsString(entity), createJsonLdHeaders());
            ResponseEntity<String> response = restTemplate.exchange(ORION_URL, HttpMethod.POST, req, String.class);
            log.info("Created building: {}", entity.get("id"));
        } catch (Exception ex) {
            log.warn("Failed to create {}: {}", entity.get("id"), ex.getMessage());
        }
    }

    @Override
    public void createEntities(List<ObjectNode> entities) {
        if (entities == null || entities.isEmpty()) {
            log.info("No entities to send to Orion-LD.");
            return;
        }
        HttpHeaders headers = createJsonLdHeaders();

        try {
            String batchUrl = ORION_URL.replace("/entities", "/entityOperations/create");

            String json = objectMapper.writeValueAsString(entities);
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
}
