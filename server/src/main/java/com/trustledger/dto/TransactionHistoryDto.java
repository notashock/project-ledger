package com.trustledger.dto;

import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class TransactionHistoryDto {
    private String farmerName;
    private String village;
    private String phone;
    private BigDecimal netBalance;
    private List<TransactionItemDto> transactions;
}
