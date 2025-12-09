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
package com.tpd.XCity.entity.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "camera_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CameraConfig {
    @Id
    private String id;
    @Field("stream_id")
    private String streamId;
    private String address;
    private List<String> classes;
    private double conf;
    @Field("image_pts")
    private List<List<Integer>> imagePts;
    @Field("limit_fps")
    private int limitFps;
    @Field("segment_ids")
    private List<String> segmentIds;
    @Field("tracker_cfg")
    private String trackerCfg;
    @Field("video_path")
    private String videoPath;
    @Field("world_pts")
    private List<List<Integer>> worldPts;
}
