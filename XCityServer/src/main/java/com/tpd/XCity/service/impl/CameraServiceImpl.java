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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tpd.XCity.dto.request.CameraCreateRequest;
import com.tpd.XCity.dto.response.*;
import com.tpd.XCity.entity.device.Camera;
import com.tpd.XCity.entity.device.CameraConfig;
import com.tpd.XCity.entity.device.Device;
import com.tpd.XCity.entity.device.DeviceStatus;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.CameraMapper;
import com.tpd.XCity.mapper.DeviceMapper;
import com.tpd.XCity.repository.CameraConfigRepository;
import com.tpd.XCity.repository.CameraRepository;
import com.tpd.XCity.repository.DeviceRepository;
import com.tpd.XCity.service.CameraService;
import com.tpd.XCity.service.OrionService;
import com.tpd.XCity.utils.APIResponseMessage;
import com.tpd.XCity.utils.Helper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.tpd.XCity.utils.AppConstant.DEVICE_CONTEXT;
import static com.tpd.XCity.utils.Helper.getIdFromURN;
import static com.tpd.XCity.utils.Helper.getURNId;

@Service
@RequiredArgsConstructor
@Slf4j
public class CameraServiceImpl implements CameraService {
    private final CameraRepository cameraRepository;
    private final CameraConfigRepository cameraConfigRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final OrionService orionService;
    private final CameraMapper cameraMapper;

    @Override
    public CameraResponse getCamera(String id) {
        Camera camera = cameraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found camera"));
        CameraResponse cameraResponse = cameraMapper.convertToResponse(camera);

        CameraConfig cameraConfig = cameraConfigRepository.findByStreamId(camera.getId())
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found camera config"));

        cameraResponse.setCameraConfig(CameraResponse.CameraConfigResponse.builder()
                .id(cameraConfig.getId())
                .conf(cameraConfig.getConf())
                .address(cameraConfig.getAddress())
                .classes(cameraConfig.getClasses())
                .limitFps(cameraConfig.getLimitFps())
                .imagePts(cameraConfig.getImagePts())
                .segmentIds(cameraConfig.getSegmentIds())
                .streamId(cameraConfig.getStreamId())
                .videoPath(cameraConfig.getVideoPath())
                .trackerCfg(cameraConfig.getTrackerCfg())
                .worldPts(cameraConfig.getWorldPts())
                .build());

        return cameraResponse;
    }

    @Override
    public List<CameraOverviewResponse> getAllCamera() {
        List<CameraOverviewResponse> cameraOverviewResponses = cameraRepository.findAll().stream()
                .map(c -> cameraMapper.convertToOverviewResponse(c))
                .collect(Collectors.toList());

        return cameraOverviewResponses;
    }

    @Override
    public MessageResponse createCamera(CameraCreateRequest request) {
        Camera camera = cameraMapper.convertToEntity(request);
        camera.setId(getURNId(camera.getType()));

        orionService.createEntity(cameraMapper.toOrion(camera), DEVICE_CONTEXT);

        cameraRepository.save(camera);

        return MessageResponse.builder()
                .message(APIResponseMessage.SUCCESSFULLY_CREATED.name())
                .status(HttpStatus.CREATED)
                .build();

    }

    @Override
    public MessageResponse updateCamera(String id, CameraCreateRequest request) {
        try {
            Camera camera = cameraRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));
            Camera oldCamera = objectMapper.readValue(objectMapper.writeValueAsString(camera), Camera.class);

            cameraMapper.updateCamera(request, camera);

            Map<String, Object> diff = Helper.getChangedFields(oldCamera, camera);
            orionService.patchAttributes(id, diff, DEVICE_CONTEXT);

            cameraRepository.save(camera);
            return MessageResponse.builder()
                    .message(APIResponseMessage.SUCCESSFULLY_UPDATED.name())
                    .status(HttpStatus.OK)
                    .data(Map.of("id", id))
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public PageResponse searchCamera(String kw, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Camera> pageCamera = cameraRepository.searchCamera(kw, pageable);

        List<CameraResponse> data = pageCamera.get()
                .map(p -> cameraMapper.convertToResponse(p))
                .collect(Collectors.toList());

        return PageResponse.<CameraResponse>builder()
                .content(data)
                .last(pageCamera.isLast())
                .totalPages(pageCamera.getTotalPages())
                .page(page)
                .size(pageCamera.getSize())
                .totalElements(pageCamera.getTotalElements())
                .build();
    }
}
