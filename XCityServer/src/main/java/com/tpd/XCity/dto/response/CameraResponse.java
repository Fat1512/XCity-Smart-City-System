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
package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import com.tpd.XCity.entity.building.Location;
import com.tpd.XCity.entity.device.CameraUsage;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class CameraResponse {

    private String id;
    private Address address;
    private String cameraName;
    private String dataProvider;
    private LocalDateTime dateCreated;
    private LocalDateTime dateModified;
    private String description;
    private CameraUsage cameraUsage;
    private Location location;
    private boolean on;
    private String type = "Camera";
}
