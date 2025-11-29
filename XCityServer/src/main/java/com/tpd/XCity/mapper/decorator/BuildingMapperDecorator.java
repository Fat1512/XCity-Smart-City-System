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

    private final Map<String, String> DAY_SHORT = Map.of(
            "monday", "Mo",
            "tuesday", "Tu",
            "wednesday", "We",
            "thursday", "Th",
            "friday", "Fr",
            "saturday", "Sa",
            "sunday", "Su"
    );
    private final Map<String, String> SHORT_DAY = Map.of(
            "Mo", "monday",
            "Tu", "tuesday",
            "We", "wednesday",
            "Th", "thursday",
            "Fr", "friday",
            "Sa", "saturday",
            "Su", "sunday"
    );

    @Override
    public void updateBuilding(BuildingUpdateRequest request, Building building) {
        delegate.updateBuilding(request, building);

        if (request.getOpeningHours() != null) {
            List<String> result = formatOH(request);
            building.setOpeningHours(result);
        }
    }

    @Override
    public Building convertToEntity(BuildingUpdateRequest request) {
        Building building = delegate.convertToEntity(request);
        if (request.getOpeningHours() != null) {
            List<String> result = formatOH(request);
            building.setOpeningHours(result);
        }
        return building;
    }

    @Override
    public BuildingDetailResponse convertToDetailResponse(Building building) {
        BuildingDetailResponse buildingDetailResponse = delegate.convertToDetailResponse(building);
        if (building.getOpeningHours() != null) {
            Map<String, OH> result = new LinkedHashMap<>();

            for (String range : building.getOpeningHours()) {
                String[] parts = range.split(" ");
                String dayPart = parts[0];
                String timePart = parts[1];

                String[] times = timePart.split("-");
                String open = times[0];
                String close = times[1];

                if (dayPart.contains("-")) {
                    // Mo-Fr
                    String[] dayRange = dayPart.split("-");
                    String start = dayRange[0];
                    String end = dayRange[1];

                    List<String> ordered = List.of("Mo", "Tu", "We", "Th", "Fr", "Sa", "Su");
                    int startIndex = ordered.indexOf(start);
                    int endIndex = ordered.indexOf(end);

                    for (int i = startIndex; i <= endIndex; i++) {
                        result.put(SHORT_DAY.get(ordered.get(i)), new OH(open, close));
                    }
                } else {

                    result.put(SHORT_DAY.get(dayPart), new OH(open, close));
                }
            }

            buildingDetailResponse.setOpeningHours(result);
        }
        return buildingDetailResponse;
    }

    private String formatRange(String start, String end, OH time) {
        String range = DAY_SHORT.get(start);
        if (!start.equals(end)) {
            range += "-" + DAY_SHORT.get(end);
        }
        return range + " " + time.getOpens() + "-" + time.getCloses();
    }

    private List<String> formatOH(BuildingUpdateRequest request) {
        List<Map.Entry<String, OH>> days = request.getOpeningHours().entrySet()
                .stream()
                .filter(e -> e.getValue() != null && e.getValue().checkExists())
                .sorted(Comparator.comparing(e -> List.of(
                        "monday", "tuesday", "wednesday", "thursday",
                        "friday", "saturday", "sunday"
                ).indexOf(e.getKey())))
                .toList();

        List<String> result = new ArrayList<>();

        String startDay = null;
        String prevDay = null;
        OH prevTime = null;

        for (var e : days) {
            String day = e.getKey();
            OH time = new OH(e.getValue().getOpens(), e.getValue().getCloses());

            if (prevTime == null || !prevTime.equals(time)) {
                if (startDay != null && prevDay != null) {
                    result.add(formatRange(startDay, prevDay, prevTime));
                }
                startDay = day;
            }

            prevDay = day;
            prevTime = time;
        }

        if (startDay != null && prevDay != null && prevTime != null) {
            result.add(formatRange(startDay, prevDay, prevTime));
        }
        return result;
    }

}
