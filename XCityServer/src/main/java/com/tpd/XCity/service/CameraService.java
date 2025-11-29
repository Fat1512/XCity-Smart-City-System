package com.tpd.XCity.service;

import com.tpd.XCity.dto.request.CameraCreateRequest;
import com.tpd.XCity.dto.response.CameraOverviewResponse;
import com.tpd.XCity.dto.response.CameraResponse;
import com.tpd.XCity.dto.response.MessageResponse;
import com.tpd.XCity.dto.response.PageResponse;

import java.util.List;

public interface CameraService {
    CameraResponse getCamera(String id);
    List<CameraOverviewResponse> getAllCamera();

    MessageResponse createCamera(CameraCreateRequest request);

    MessageResponse updateCamera(String id, CameraCreateRequest request);

    PageResponse searchCamera(String kw, int page, int size);
}
