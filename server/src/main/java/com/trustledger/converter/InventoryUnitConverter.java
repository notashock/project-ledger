package com.trustledger.converter;

import com.trustledger.model.enums.InventoryUnit;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class InventoryUnitConverter implements AttributeConverter<InventoryUnit, String> {

    @Override
    public String convertToDatabaseColumn(InventoryUnit attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public InventoryUnit convertToEntityAttribute(String dbData) {
        return dbData == null ? null : InventoryUnit.fromValue(dbData);
    }
}
