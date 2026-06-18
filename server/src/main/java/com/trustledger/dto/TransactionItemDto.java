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
}
