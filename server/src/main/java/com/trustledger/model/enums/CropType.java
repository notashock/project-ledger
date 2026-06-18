package com.trustledger.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CropType {
    RICE("rice"),
    MAIZE("maize");

    private final String value;

    CropType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static CropType fromValue(String value) {
        if (value == null) return null;
        for (CropType type : CropType.values()) {
            if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        // Fallbacks for legacy/UI values stored in DB
        String cleanVal = value.trim().toLowerCase();
        if (cleanVal.equals("corn")) {
            return MAIZE;
        }
        
        // Log/warn and fallback to a default instead of crashing
        System.err.println("WARNING: Unknown crop type string in DB: " + value);
        return RICE;
    }
}
