package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.SourceType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class InventoryTraceDto {
    private UUID id;
    private LocalDate date;
    private String godownName;
    private CropType cropType;
    private SourceType sourceType;
    private BigDecimal quantity;
    private UUID referenceId;
    private String notes;
}
