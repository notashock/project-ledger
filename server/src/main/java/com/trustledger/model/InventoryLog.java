package com.trustledger.model;

import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.InventoryUnit;
import com.trustledger.model.enums.SourceType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "inventory_logs")
@Data
@NoArgsConstructor
public class InventoryLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "godown_id")
    private Godown godown;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SourceType sourceType;

    @Column(nullable = false)
    private CropType cropType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false)
    private InventoryUnit unit;

    private UUID referenceId;
    
    private String vehicle;
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;
}
