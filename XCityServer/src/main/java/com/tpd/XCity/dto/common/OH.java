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