package com.tpd.XCity.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class DeviceIoTAgent {
    private String deviceId;
    private String entityName;
    private String entityType;
    private String transport;
    private String apikey;
    private List<Attribute> attributes;

    @Data
    @Builder
    @AllArgsConstructor
    public static class Attribute {
        private String objectId;
        private String name;
        private String type;
    }
}
