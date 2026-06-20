package com.trustledger.repository;

import com.trustledger.model.Godown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GodownRepository extends JpaRepository<Godown, UUID> {
    java.util.List<Godown> findByUser(com.trustledger.model.AppUser user);
    java.util.Optional<Godown> findByIdAndUser(UUID id, com.trustledger.model.AppUser user);
}
