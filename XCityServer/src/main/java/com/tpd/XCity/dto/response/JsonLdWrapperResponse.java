package com.tpd.XCity.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class JsonLdWrapperResponse<T> {
    @JsonProperty("@context")
    private List<String> context;

    private T data;

}
