package com.trustledger.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ExtractedDebitDto {
    private String farmerName;
    private String category;
    private BigDecimal costAmount;
    private String description;
    
    // Once mapped to an actual farmer, this will be populated
    private UUID farmerId;
}
