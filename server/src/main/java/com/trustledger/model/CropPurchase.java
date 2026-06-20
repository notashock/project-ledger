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
@Table(name = "crop_purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "godown_id")
    private Godown godown;

    private LocalDate date;
    private CropType cropType;
    @Column(precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(precision = 10, scale = 2)
    private BigDecimal rateApplied;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalValue;

    private String remarks;

    @Column(precision = 10, scale = 2)
    private BigDecimal bagWeight;

    @Column(precision = 10, scale = 2)
    private BigDecimal noOfBags;

    @Column(precision = 10, scale = 2)
    private BigDecimal machineCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;
}
