package com.tpd.XCity.service;

import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.BuildingOverviewResponse;
import com.tpd.XCity.dto.response.DeviceResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.dto.response.PageResponse;

public interface DeviceService {
    MessageResponse createDevice(DeviceCreateRequest request);

    MessageResponse startSensor(String id);

    MessageResponse stopSensor(String id);

    PageResponse<DeviceResponse> getDevices(String kw, int page, int size);

    DeviceResponse getDeviceById(String id);
}
