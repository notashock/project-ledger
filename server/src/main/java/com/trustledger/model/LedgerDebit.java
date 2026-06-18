package com.trustledger.model;

import com.trustledger.model.enums.DebitCategory;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ledger_debits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LedgerDebit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private DebitCategory category;

    @Column(precision = 12, scale = 2)
    private BigDecimal costAmount;

    private String description;
}
