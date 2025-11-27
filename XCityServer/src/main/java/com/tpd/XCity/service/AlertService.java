package com.tpd.XCity.service;

import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.response.AlertResponse;
import com.tpd.XCity.dto.response.MessageResponse;

import java.util.List;

public interface AlertService {
    MessageResponse createAlert(AlertCreateRequest alertCreateRequest);

    List<AlertResponse> getAlerts();
}
