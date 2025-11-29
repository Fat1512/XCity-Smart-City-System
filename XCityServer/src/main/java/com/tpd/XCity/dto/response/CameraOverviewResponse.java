package com.tpd.XCity.dto.response;

import com.tpd.XCity.entity.Address;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CameraOverviewResponse {

    private String id;
    private Address address;
    private String cameraName;
}
