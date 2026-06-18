package com.trustledger.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum InventoryUnit {
    BAGS("Bags"),
    QUINTALS("Quintals"),
    TONS("Tons"),
    MT("MT"),
    KG("KG");

    private final String value;

    InventoryUnit(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static InventoryUnit fromValue(String value) {
        if (value == null) return null;
        for (InventoryUnit unit : InventoryUnit.values()) {
            if (unit.value.equalsIgnoreCase(value) || unit.name().equalsIgnoreCase(value)) {
                return unit;
            }
        }
        System.err.println("WARNING: Unknown inventory unit string in DB: " + value);
        return BAGS;
    }
}
