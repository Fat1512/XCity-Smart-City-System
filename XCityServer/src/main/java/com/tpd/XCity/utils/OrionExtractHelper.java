package com.tpd.XCity.utils;

import java.time.LocalDateTime;
import java.util.Map;

public class OrionExtractHelper {
    public static Double extractDouble(Map<String, Object> payload, String key) {
        Object node = payload.get(key);
        if (node != null) {
            try {
                return Double.valueOf(node.toString());
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    public static String extractString(Map<String, Object> payload, String key) {
        Object node = payload.get(key);
        if (node instanceof Map<?, ?> map && map.get("value") != null) {
            return map.get("value").toString();
        }
        return null;
    }


    public static LocalDateTime extractObservedAt(Map<String, Object> payload, String key) {
        if (!payload.containsKey(key)) return null;
        Object node = payload.get(key);
        if (node instanceof Map map && map.get("observedAt") != null) {
            try {
                return LocalDateTime.parse(map.get("observedAt").toString().replace("Z", ""));
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
