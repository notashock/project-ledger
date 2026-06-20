package com.trustledger.repository;

import com.trustledger.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, UUID> {
    java.util.Optional<Farmer> findByNameAndVillageAndUser(String name, String village, com.trustledger.model.AppUser user);
    java.util.List<Farmer> findByUser(com.trustledger.model.AppUser user);
    java.util.Optional<Farmer> findByIdAndUser(UUID id, com.trustledger.model.AppUser user);
}
