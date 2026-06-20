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
    java.util.List<CropPurchase> findByUser(com.trustledger.model.AppUser user);
    java.util.Optional<CropPurchase> findByIdAndUser(UUID id, com.trustledger.model.AppUser user);

    List<CropPurchase> findByFarmerIdAndUserOrderByDateDesc(UUID farmerId, com.trustledger.model.AppUser user);
    List<CropPurchase> findByGodownIdAndUserOrderByDateDesc(UUID godownId, com.trustledger.model.AppUser user);

    @Query("SELECT SUM(c.weight) FROM CropPurchase c WHERE c.cropType = :cropType AND c.user = :user")
    java.math.BigDecimal getTotalWeightByCropTypeAndUser(@Param("cropType") CropType cropType, @Param("user") com.trustledger.model.AppUser user);

    @Query("SELECT SUM(c.weight) FROM CropPurchase c WHERE c.cropType = :cropType AND c.date = :date AND c.user = :user")
    java.math.BigDecimal getTodayWeightByCropTypeAndUser(@Param("cropType") CropType cropType, @Param("date") LocalDate date, @Param("user") com.trustledger.model.AppUser user);
}
