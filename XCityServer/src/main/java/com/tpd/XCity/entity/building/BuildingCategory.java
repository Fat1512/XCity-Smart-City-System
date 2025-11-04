package com.tpd.XCity.entity.building;

public enum BuildingCategory {
    APARTMENTS("apartments"),
    BAKEHOUSE("bakehouse"),
    BARN("barn"),
    BRIDGE("bridge"),
    BUNGALOW("bungalow"),
    BUNKER("bunker"),
    CATHEDRAL("cathedral"),
    CABIN("cabin"),
    CARPORT("carport"),
    CEMETERY("cemetery"),
    CHAPEL("chapel"),
    CHURCH("church"),
    CIVIC("civic"),
    COMMERCIAL("commercial"),
    CONSERVATORY("conservatory"),
    CONSTRUCTION("construction"),
    COWSHED("cowshed"),
    DETACHED("detached"),
    DIGESTER("digester"),
    DORMITORY("dormitory"),
    FARM("farm"),
    FARM_AUXILIARY("farm_auxiliary"),
    GARAGE("garage"),
    GARAGES("garages"),
    GARBAGE_SHED("garbage_shed"),
    GRANDSTAND("grandstand"),
    GREENHOUSE("greenhouse"),
    HANGAR("hangar"),
    HOSPITAL("hospital"),
    HOTEL("hotel"),
    HOUSE("house"),
    HOUSEBOAT("houseboat"),
    HUT("hut"),
    INDUSTRIAL("industrial"),
    KINDERGARTEN("kindergarten"),
    KIOSK("kiosk"),
    MOSQUE("mosque"),
    OFFICE("office"),
    PARKING("parking"),
    PAVILION("pavilion"),
    PUBLIC("public"),
    RESIDENTIAL("residential"),
    RETAIL("retail"),
    RIDING_HALL("riding_hall"),
    ROOF("roof"),
    RUINS("ruins"),
    SCHOOL("school"),
    SERVICE("service"),
    SHED("shed"),
    SHRINE("shrine"),
    STABLE("stable"),
    STADIUM("stadium"),
    STATIC_CARAVAN("static_caravan"),
    STY("sty"),
    SYNAGOGUE("synagogue"),
    TEMPLE("temple"),
    TERRACE("terrace"),
    TRAIN_STATION("train_station"),
    TRANSFORMER_TOWER("transformer_tower"),
    TRANSPORTATION("transportation"),
    UNIVERSITY("university"),
    WAREHOUSE("warehouse"),
    WATER_TOWER("water_tower");

    private final String value;

    BuildingCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
