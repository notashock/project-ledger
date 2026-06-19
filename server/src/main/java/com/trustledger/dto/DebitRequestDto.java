package com.trustledger.dto;

import com.trustledger.model.enums.DebitCategory;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class DebitRequestDto {
    private UUID farmerId;
    private LocalDate date;
    private DebitCategory category;
    private BigDecimal costAmount;
    private String description;
    private String otherCategorySpecify;
}
