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

import com.tpd.XCity.dto.common.OH;
import com.tpd.XCity.dto.request.BuildingUpdateRequest;
import com.tpd.XCity.dto.response.BuildingDetailResponse;
import com.tpd.XCity.entity.building.Building;
import com.tpd.XCity.mapper.BuildingMapper;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@NoArgsConstructor
public abstract class BuildingMapperDecorator implements BuildingMapper {

    @Autowired
    private BuildingMapper delegate;


    @Override
    public void updateBuilding(BuildingUpdateRequest request, Building building) {
        delegate.updateBuilding(request, building);

    }

    @Override
    public Building convertToEntity(BuildingUpdateRequest request) {
        Building building = delegate.convertToEntity(request);
        return building;
    }

    @Override
    public BuildingDetailResponse convertToDetailResponse(Building building) {
        BuildingDetailResponse buildingDetailResponse = delegate.convertToDetailResponse(building);
        return buildingDetailResponse;
    }


}
