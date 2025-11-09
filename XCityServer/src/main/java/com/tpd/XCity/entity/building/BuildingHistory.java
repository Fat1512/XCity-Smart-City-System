package com.tpd.XCity.entity.building;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "building_history")
public class BuildingHistory {
    @Id
    private String id;

    private String buildingId;

    private Building oldData;
    private Building newData;

    private String changedBy;

    private OffsetDateTime changedAt;
}