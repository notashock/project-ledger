package com.trustledger.repository;

import com.trustledger.model.LedgerDebit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerDebitRepository extends JpaRepository<LedgerDebit, UUID> {
    java.util.List<LedgerDebit> findByUser(com.trustledger.model.AppUser user);
    java.util.Optional<LedgerDebit> findByIdAndUser(UUID id, com.trustledger.model.AppUser user);

    List<LedgerDebit> findByFarmerIdAndUserOrderByDateDesc(UUID farmerId, com.trustledger.model.AppUser user);
}
