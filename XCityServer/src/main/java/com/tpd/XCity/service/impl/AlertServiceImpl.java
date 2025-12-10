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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.alert.Alert;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.mapper.AlertMapper;
import com.tpd.XCity.repository.AirQualityObservedRepository;
import com.tpd.XCity.repository.AlertRepository;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.service.AlertService;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.APIResponseMessage;
import com.tpd.XCity.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.AppConstant.ALERT_CONTEXT;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {
    private final AlertRepository alertRepository;
    private final AlertMapper alertMapper;
    private final OrionService orionService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public MessageResponse createAlert(AlertCreateRequest alertCreateRequest) {
        Alert alert = alertMapper.convertToEntity(alertCreateRequest);
        alert.setId(Helper.getURNId(alert.getType()));
        alert.setDateCreated(Instant.now());
        alert.setDateIssued(Instant.now());

        orionService.createEntity(alertMapper.toOrion(alert), ALERT_CONTEXT);
        alertRepository.save(alert);

        messagingTemplate.convertAndSend("/topic/alerts",
                alertMapper.convertToResponse(alert));


        return MessageResponse.builder()
                .message(APIResponseMessage.SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public MessageResponse markSolved(String id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found alert"));
        alert.setSolved(true);
        alertRepository.save(alert);
        return MessageResponse.builder()
                .status(HttpStatus.OK)
                .message(APIResponseMessage.SUCCESSFULLY_UPDATED.name())
                .build();
    }

    @Override
    public List<AlertResponse> getAlerts() {
        List<AlertResponse> alertResponses = alertRepository.findAllBySolved(false).stream()
                .map(a -> alertMapper.convertToResponse(a))
                .collect(Collectors.toList());

        return alertResponses;
    }

    private LocalDateTime getStartDate(String range) {

        LocalDate today = LocalDate.now();

        return switch (range.toLowerCase()) {
            case "today" -> today.atStartOfDay();
            case "week" -> today.with(DayOfWeek.MONDAY).atStartOfDay();
            case "month" -> today.withDayOfMonth(1).atStartOfDay();
            default -> today.atStartOfDay();
        };
    }

    @Override
    public AlertStaticsResponse getStaticsAlert(String type) {
        Instant start = getStartDate(type)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        Instant end = LocalDateTime.now()
                .atZone(ZoneId.systemDefault())
                .toInstant();

        long total = alertRepository.findByDateCreatedBetween(start, end, Pageable.unpaged()).size();
        long solved = alertRepository.countBySolvedAndDateCreatedBetween(true, start, end);
        long unsolved = total - solved;

        Map<String, Long> categoryCount =
                alertRepository.groupByCategory(start, end)
                        .stream()
                        .collect(Collectors.toMap(
                                m -> m.get("_id").toString(),
                                m -> Long.valueOf(m.get("count").toString())
                        ));

        Map<String, Long> subCategoryCount =
                alertRepository.groupBySubCategory(start, end)
                        .stream()
                        .collect(Collectors.toMap(
                                m -> m.get("_id").toString(),
                                m -> Long.valueOf(m.get("count").toString())
                        ));
        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "dateCreated"));
        List<AlertResponse> latest = alertRepository
                .findByDateCreatedBetween(start, end, pageable)
                .stream()
                .map(alertMapper::convertToResponse)
                .toList();

        return AlertStaticsResponse.builder()
                .recentAlerts(latest)
                .categoryCounts(categoryCount)
                .subCategoryCounts(subCategoryCount)
                .total(total)
                .unsolved(unsolved)
                .solved(solved)
                .build();
    }

    @Override
    public List<AlertResponse> getDataForDownload(String type) {
        Instant start = getStartDate(type)
                .atZone(ZoneId.systemDefault())
                .toInstant();

        Instant end = LocalDateTime.now()
                .atZone(ZoneId.systemDefault())
                .toInstant();

        List<AlertResponse> latest = alertRepository
                .findByDateCreatedBetween(start, end, Pageable.unpaged())
                .stream()
                .map(alertMapper::convertToResponse)
                .toList();

        return latest;
    }

    @Override
    public PageResponse<AlertResponse> getAlertOverview(String solved, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreated"));

        Page<Alert> alertPage;
        if (solved == null) {
            alertPage = alertRepository.findAll(pageable);
        } else {
            alertPage = alertRepository.findBySolved(Boolean.parseBoolean(solved), pageable);
        }

        List<AlertResponse> data = alertPage.get()
                .map(p -> alertMapper.convertToResponse(p))
                .collect(Collectors.toList());
        return PageResponse.<AlertResponse>builder()
                .content(data)
                .last(alertPage.isLast())
                .totalPages(alertPage.getTotalPages())
                .page(page)
                .size(alertPage.getSize())
                .totalElements(alertPage.getTotalElements())
                .build();
    }

    @Override
    public PageResponse<AlertOverviewResponse> getAlertNotSolved(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreated"));

        Page<Alert> alertPage = alertRepository.findBySolved(false, pageable);

        List<AlertOverviewResponse> data = alertPage.get()
                .map(p -> alertMapper.convertToOverviewResponse(p))
                .collect(Collectors.toList());

        return PageResponse.<AlertOverviewResponse>builder()
                .content(data)
                .last(alertPage.isLast())
                .totalPages(alertPage.getTotalPages())
                .page(page)
                .size(alertPage.getSize())
                .totalElements(alertPage.getTotalElements())
                .build();
    }
}
