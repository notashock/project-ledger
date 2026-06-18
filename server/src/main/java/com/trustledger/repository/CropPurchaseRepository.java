package com.trustledger.repository;

import com.trustledger.model.CropPurchase;
import com.trustledger.model.enums.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface CropPurchaseRepository extends JpaRepository<CropPurchase, UUID> {
    List<CropPurchase> findByFarmerIdOrderByDateDesc(UUID farmerId);
    List<CropPurchase> findByGodownIdOrderByDateDesc(UUID godownId);

    @Query("SELECT SUM(c.weight) FROM CropPurchase c WHERE c.cropType = :cropType")
    java.math.BigDecimal getTotalWeightByCropType(@Param("cropType") CropType cropType);

    @Query("SELECT SUM(c.weight) FROM CropPurchase c WHERE c.cropType = :cropType AND c.date = :date")
    java.math.BigDecimal getTodayWeightByCropType(@Param("cropType") CropType cropType, @Param("date") LocalDate date);
}
