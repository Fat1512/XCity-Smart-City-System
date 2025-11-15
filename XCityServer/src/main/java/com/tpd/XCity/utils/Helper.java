package com.tpd.XCity.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public class Helper {
    public static String getURNId(String type) {
        return String.format("urn:ngsi-ld:%s:%s", type, UUID.randomUUID());
    }

    public static String getIdFromURN(String urnId) {
        if (urnId == null) return "";
        return urnId.split(":")[3];
    }

    public static Map<String, Object> getChangedFields(Object oldObj, Object newObj) {
        Map<String, Object> changes = new HashMap<>();
        if (oldObj == null || newObj == null) return changes;

        Class<?> clazz = newObj.getClass();

        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object oldValue = getFieldValue(oldObj, field.getName());
                Object newValue = field.get(newObj);

                if (!Objects.equals(oldValue, newValue)) {
                    changes.put(field.getName(), newValue);
                }

            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        return changes;
    }

    private static Object getFieldValue(Object obj, String fieldName) {
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null;
        }
    }

    public static void safeSet(ObjectNode root, String key, ObjectMapper mapper, Object value) {
        if (value != null) {
            ObjectNode node = mapper.createObjectNode();
            node.put("type", "Property");
            node.set("value", mapper.valueToTree(value));
            root.set(key, node);
        }
    }

    public static String getValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asText(null) : null;
    }

    public static Integer getIntValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asInt() : null;
    }

    public static Double getDoubleValue(JsonNode json, String key) {
        return json.has(key) ? json.path(key).path("value").asDouble() : null;
    }
}
