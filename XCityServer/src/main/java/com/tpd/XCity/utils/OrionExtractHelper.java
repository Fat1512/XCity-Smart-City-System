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
