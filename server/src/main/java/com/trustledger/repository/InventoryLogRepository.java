package com.trustledger.repository;

import com.trustledger.dto.InventorySummaryDto;
import com.trustledger.model.InventoryLog;
import com.trustledger.model.enums.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, UUID> {
    
    List<InventoryLog> findAllByOrderByDateDesc();

    List<InventoryLog> findByCropTypeOrderByDateDesc(CropType cropType);

    @Query("SELECT new com.trustledger.dto.InventorySummaryDto(g.id, g.name, i.cropType, SUM(i.quantity)) " +
           "FROM InventoryLog i JOIN i.godown g " +
           "GROUP BY g.id, g.name, i.cropType")
    List<InventorySummaryDto> getInventorySummary();

    List<InventoryLog> findByGodownId(UUID godownId);

    void deleteByReferenceId(UUID referenceId);

    List<InventoryLog> findByReferenceId(UUID referenceId);

    @Query("SELECT SUM(i.quantity) FROM InventoryLog i WHERE i.godown.id = :godownId")
    java.math.BigDecimal sumQuantityByGodownId(@Param("godownId") UUID godownId);
}
