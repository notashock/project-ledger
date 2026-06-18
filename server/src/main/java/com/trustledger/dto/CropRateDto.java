package com.trustledger.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropRateDto {
    private BigDecimal buyRate;
    private BigDecimal bagWeight;
}
