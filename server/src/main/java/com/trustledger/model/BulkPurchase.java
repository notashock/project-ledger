package com.trustledger.model;

import com.trustledger.model.enums.CropType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "bulk_purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkPurchase {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String supplierName;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CropType cropType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal weight;

    @Column(precision = 12, scale = 2)
    private BigDecimal amountSpent;

    @Column(precision = 12, scale = 2)
    private BigDecimal ratePerQuintal;

    @Column(precision = 10, scale = 2)
    private BigDecimal bagWeight;

    @Column(precision = 10, scale = 2)
    private BigDecimal noOfBags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "godown_id", nullable = false)
    private Godown godown;
}
