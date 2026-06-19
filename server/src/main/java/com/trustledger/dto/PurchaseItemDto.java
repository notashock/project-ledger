package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseItemDto {
    private UUID id;
    private LocalDate date;
    private String sourceType; // "FARMER" or "BULK"
    private String supplierName; // Farmer name or Supplier Name
    private CropType cropType;
    private BigDecimal weight;
    private BigDecimal noOfBags;
    private BigDecimal amountSpent;

    // Fields for editing support in frontend
    private BigDecimal bagWeight;
    private BigDecimal rateApplied;
    private BigDecimal ratePerQuintal;
    private BigDecimal machineCost;
    private String remarks;
    private UUID godownId;
    private UUID farmerId;
}
