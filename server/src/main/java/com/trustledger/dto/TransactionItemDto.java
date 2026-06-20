package com.trustledger.dto;

import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class TransactionItemDto {
    private UUID id;
    private LocalDate date;
    private String type;
    private String description;
    private BigDecimal amount;
    private String sign;

    // Additional fields for editing purchases
    private String cropType;
    private BigDecimal weight;
    private BigDecimal rateApplied;
    private BigDecimal bagWeight;
    private BigDecimal noOfBags;
    private BigDecimal machineCost;
    private UUID godownId;
    private String remarks;

    // Additional fields for editing debits
    private String category;
    private String rawDescription;
    private String otherCategorySpecify;

    // Farmer info (for global listing)
    private String farmerName;
}
