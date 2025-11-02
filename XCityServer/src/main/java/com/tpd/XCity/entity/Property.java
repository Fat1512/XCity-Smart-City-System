package com.tpd.XCity.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property<T> {
    private String type = "Property";
    private T value;

    public Property(T value) {
        this.value = value;
    }
}