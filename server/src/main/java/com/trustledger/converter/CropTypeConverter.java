package com.trustledger.converter;

import com.trustledger.model.enums.CropType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CropTypeConverter implements AttributeConverter<CropType, String> {

    @Override
    public String convertToDatabaseColumn(CropType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public CropType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : CropType.fromValue(dbData);
    }
}
