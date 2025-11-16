package com.tpd.XCity.service;

import com.tpd.XCity.dto.request.DeviceCreateRequest;
import com.tpd.XCity.dto.response.*;

import java.util.List;

public interface DeviceService {
    MessageResponse createDevice(DeviceCreateRequest request);

    MessageResponse startSensor(String id);

    MessageResponse stopSensor(String id);

    MessageResponse updateDevice(String deviceId, DeviceCreateRequest request);

    PageResponse<DeviceResponse> getDevices(String kw, int page, int size);

    List<DeviceLocation> getDevices();

    DeviceResponse getDeviceById(String id);
}
