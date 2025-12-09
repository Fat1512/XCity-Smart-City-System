package com.tpd.XCity.entity.device;

import lombok.AllArgsConstructor;
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
