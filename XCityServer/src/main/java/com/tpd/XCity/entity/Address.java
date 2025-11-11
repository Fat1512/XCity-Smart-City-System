package com.tpd.XCity.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    private String addressCountry;
    private String addressLocality;
    private String addressRegion;
    private String district;
    private String postOfficeBoxNumber;
    private String postalCode;
    private String streetAddress;
    private String streetNr;

}
