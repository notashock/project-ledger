package com.trustledger.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CropStockDetailDto {
    private BigDecimal totalWeight; // Kg
    private BigDecimal approxBags;
    private BigDecimal estimatedValue;
    private BigDecimal investedValue;
}
