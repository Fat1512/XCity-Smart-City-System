package com.tpd.XCity.service;

import com.tpd.XCity.dto.request.AlertCreateRequest;
import com.tpd.XCity.dto.response.*;

import java.util.List;

public interface AlertService {
    MessageResponse createAlert(AlertCreateRequest alertCreateRequest);

    MessageResponse markSolved(String id);

    List<AlertResponse> getAlerts();

    AlertStaticsResponse getStaticsAlert(String type);

    List<AlertResponse> getDataForDownload(String type);

    PageResponse<AlertResponse> getAlertOverview(String solved, int page, int size);

    PageResponse<AlertOverviewResponse> getAlertNotSolved(int page, int size);
}
