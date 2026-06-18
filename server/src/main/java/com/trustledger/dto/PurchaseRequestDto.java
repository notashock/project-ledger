package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseRequestDto {
    private UUID farmerId;
    private UUID godownId;
    private LocalDate date;
    private CropType cropType;
    private BigDecimal weight;
    private BigDecimal rateApplied;
    private BigDecimal totalValue;
    private String remarks;
    private Boolean updateDailyRate;
    private BigDecimal bagWeight;
    private BigDecimal noOfBags;
    private BigDecimal machineCost;
}
