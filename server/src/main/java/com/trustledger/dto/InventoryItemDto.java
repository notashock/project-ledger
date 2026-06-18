package com.trustledger.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryItemDto {
    private String name;
    private String status;
    private Double amount;
    private String unit;
    private Double todayAmount;
}
