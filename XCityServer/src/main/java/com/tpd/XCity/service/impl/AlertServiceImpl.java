package com.tpd.XCity.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.response.AlertResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.entity.alert.Alert;
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
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.AppConstant.ALERT_CONTEXT;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {
    private final AlertRepository alertRepository;
    private final AlertMapper alertMapper;
    private final OrionService orionService;

    @Override
    public MessageResponse createAlert(AlertCreateRequest alertCreateRequest) {
        Alert alert = alertMapper.convertToEntity(alertCreateRequest);
        alert.setId(Helper.getURNId(alert.getType()));
        alert.setDateCreated(Instant.now());
        alert.setDateIssued(Instant.now());

        orionService.createEntity(alertMapper.toOrion(alert), ALERT_CONTEXT);
        alertRepository.save(alert);
        return MessageResponse.builder()
                .message(APIResponseMessage.SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.CREATED)
                .build();
    }

    @Override
    public List<AlertResponse> getAlerts() {
        List<AlertResponse> alertResponses = alertRepository.findAll().stream()
                .map(a -> alertMapper.convertToResponse(a))
                .collect(Collectors.toList());

        return alertResponses;
    }
}
