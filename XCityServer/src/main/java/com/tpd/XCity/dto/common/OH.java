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
package com.tpd.XCity.dto.common;

import com.tpd.XCity.mapper.decorator.BuildingMapperDecorator;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OH {
    private String opens;
    private String closes;

    public boolean checkExists() {
        if (this.opens == null || this.closes == null || "".equals(this.opens.trim()) || "".equals(this.closes.trim()))
            return false;

        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OH)) return false;
        OH oh = (OH) o;
        return Objects.equals(opens, oh.opens) && Objects.equals(closes, oh.closes);
    }

    @Override
    public int hashCode() {
        return Objects.hash(opens, closes);
    }
}