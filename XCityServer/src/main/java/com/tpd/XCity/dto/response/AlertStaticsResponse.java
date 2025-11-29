package com.tpd.XCity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AlertStaticsResponse {
    private long total;
    private long solved;
    private long unsolved;
    private long traffic;

    private Map<String, Long> categoryCounts;
    private Map<String, Long> subCategoryCounts;

    private List<AlertResponse> recentAlerts;
}
