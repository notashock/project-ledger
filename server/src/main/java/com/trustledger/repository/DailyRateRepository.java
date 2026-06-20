package com.trustledger.repository;

import com.trustledger.model.DailyRate;
import com.trustledger.model.enums.CropType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyRateRepository extends JpaRepository<DailyRate, UUID> {
    Optional<DailyRate> findTopByCropTypeAndUserOrderByDateDesc(CropType cropType, com.trustledger.model.AppUser user);
    Optional<DailyRate> findByCropTypeAndDateAndUser(CropType cropType, LocalDate date, com.trustledger.model.AppUser user);
    java.util.List<DailyRate> findTop7ByCropTypeAndUserOrderByDateDesc(CropType cropType, com.trustledger.model.AppUser user);
}
