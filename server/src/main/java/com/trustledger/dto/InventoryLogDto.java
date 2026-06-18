package com.trustledger.dto;

import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.InventoryUnit;
import com.trustledger.model.enums.LogType;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class InventoryLogDto {
    private UUID id;
    private LocalDate date;
    private LogType type;
    private CropType cropType;
    private Double quantity;
    private InventoryUnit unit;
    private String vehicle;
    private String notes;
}
