package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryDto {
    private java.util.UUID godownId;
    private String godownName;
    private CropType cropType;
    private BigDecimal totalQuantity;
}
