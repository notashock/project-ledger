package com.trustledger.model;

import com.trustledger.model.enums.CropType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyRate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private LocalDate date;
    private CropType cropType;

    @Column(precision = 10, scale = 2)
    private BigDecimal buyRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal bagWeight;

    public BigDecimal getBagWeight() {
        return bagWeight != null ? bagWeight : BigDecimal.valueOf(101.0);
    }
}

