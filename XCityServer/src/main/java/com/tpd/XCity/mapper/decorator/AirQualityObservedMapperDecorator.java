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
package com.tpd.XCity.mapper.decorator;

import com.tpd.XCity.dto.response.AirQualityObservedResponse;
import com.tpd.XCity.entity.air.AirQualityObserved;
import com.tpd.XCity.entity.device.Device;
import com.tpd.XCity.exception.ResourceNotFoundExeption;
import com.tpd.XCity.mapper.AirQualityObservedMapper;
import com.tpd.XCity.mapper.BuildingMapper;
import com.tpd.XCity.repository.DeviceRepository;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

@NoArgsConstructor
public abstract class AirQualityObservedMapperDecorator implements AirQualityObservedMapper {
    @Autowired
    private AirQualityObservedMapper delegate;

    @Autowired
    private DeviceRepository deviceRepository;

    @Override
    public AirQualityObservedResponse convertToResponse(AirQualityObserved qualityObserved) {
        AirQualityObservedResponse response = delegate.convertToResponse(qualityObserved);
        Device device = deviceRepository.findById(qualityObserved.getRefDevice())
                .orElseThrow(() -> new ResourceNotFoundExeption("Not found device"));

        response.setDeviceName(device.getName());
        return response;
    }
}
