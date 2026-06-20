package com.trustledger.repository;

import com.trustledger.model.BulkPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BulkPurchaseRepository extends JpaRepository<BulkPurchase, UUID> {
    java.util.List<BulkPurchase> findByUser(com.trustledger.model.AppUser user);
    java.util.Optional<BulkPurchase> findByIdAndUser(UUID id, com.trustledger.model.AppUser user);

    List<BulkPurchase> findByGodownIdAndUserOrderByDateDesc(UUID godownId, com.trustledger.model.AppUser user);
}
