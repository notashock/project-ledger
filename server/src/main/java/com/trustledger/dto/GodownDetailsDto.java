package com.trustledger.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class GodownDetailsDto {
    private GodownDto godown;
    // Map from crop type string ("RICE", "MAIZE") to stock details
    private Map<String, CropStockDetailDto> cropStocks;
    private BigDecimal totalEstimatedValue;
    private BigDecimal totalInvestedValue;
    private List<PurchaseItemDto> purchases;
}
