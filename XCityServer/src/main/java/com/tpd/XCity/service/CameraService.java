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
