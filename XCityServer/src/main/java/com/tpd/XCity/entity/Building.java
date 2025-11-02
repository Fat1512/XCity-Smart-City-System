package com.tpd.XCity.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Building {
    private String id;
    private Property<Address> address;
    private Property<String> alternateName;
    private Property<String> areaServed;
    private Property<List<BuildingCategory>> category;
    private Property<Double> collapseRisk;
    private Property<ContainedInPlace> containedInPlace;
    private Property<String> dataProvider;
    private Property<OffsetDateTime> dateCreated;
    private Property<OffsetDateTime> dateModified;
    private Property<String> description;
    private Property<Double> floorsAboveGround;
    private Property<Double> floorsBelowGround;
    private GeoProperty<Location> location;
    private Property<String> mapUrl;
    private Property<String> name;
    private Property<List<String>> occupier;
    private Property<List<String>> openingHours;
    private Property<List<String>> owner;
    private Property<Double> peopleCapacity;
    private Property<Double> peopleOccupancy;
    private Property<List<String>> seeAlso;
    private Property<String> source;
    private String type = "Building";

}
