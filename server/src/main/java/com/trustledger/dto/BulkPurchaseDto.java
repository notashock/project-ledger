package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BulkPurchaseDto {
    private UUID id;
    private String supplierName;
    private LocalDate date;
    private CropType cropType;
    private BigDecimal weight;
    private BigDecimal ratePerQuintal;
    private BigDecimal amountSpent;
    private BigDecimal bagWeight;
    private BigDecimal noOfBags;
    private UUID godownId;
}
