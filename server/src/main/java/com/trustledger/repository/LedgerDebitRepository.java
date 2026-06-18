package com.trustledger.repository;

import com.trustledger.model.LedgerDebit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerDebitRepository extends JpaRepository<LedgerDebit, UUID> {
    List<LedgerDebit> findByFarmerIdOrderByDateDesc(UUID farmerId);
}
