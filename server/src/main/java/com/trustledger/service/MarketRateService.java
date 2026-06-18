package com.trustledger.service;

import com.trustledger.model.DailyRate;
import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.InventoryUnit;
import com.trustledger.repository.DailyRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.trustledger.dto.InventoryItemDto;
import com.trustledger.dto.CropRateDto;
import com.trustledger.repository.CropPurchaseRepository;

@Service
@RequiredArgsConstructor
public class MarketRateService {

    private final DailyRateRepository dailyRateRepository;
    private final CropPurchaseRepository cropPurchaseRepository;
    private final com.trustledger.repository.InventoryLogRepository inventoryLogRepository;

    @Transactional(readOnly = true)
    public Map<String, CropRateDto> getLatestRates() {
        Map<String, CropRateDto> rates = new HashMap<>();
        for (CropType crop : CropType.values()) {
            dailyRateRepository.findTopByCropTypeOrderByDateDesc(crop)
                    .ifPresentOrElse(
                        rate -> rates.put(crop.getValue(), new CropRateDto(rate.getBuyRate(), rate.getBagWeight())),
                        () -> rates.put(crop.getValue(), new CropRateDto(BigDecimal.valueOf(2450.0), BigDecimal.valueOf(101.0)))
                    );
        }
        return rates;
    }

    @Transactional(readOnly = true)
    public Map<String, List<DailyRate>> getRatesHistory() {
        Map<String, List<DailyRate>> history = new HashMap<>();
        for (CropType crop : CropType.values()) {
            List<DailyRate> list = dailyRateRepository.findTop7ByCropTypeOrderByDateDesc(crop);
            List<DailyRate> sorted = new ArrayList<>();
            for (int i = list.size() - 1; i >= 0; i--) {
                sorted.add(list.get(i));
            }
            history.put(crop.getValue(), sorted);
        }
        return history;
    }



    @Transactional
    public void updateRates(Map<String, CropRateDto> rates) {
        LocalDate today = LocalDate.now();

        for (Map.Entry<String, CropRateDto> entry : rates.entrySet()) {
            CropType crop = CropType.fromValue(entry.getKey());
            BigDecimal buyRate = entry.getValue() != null ? entry.getValue().getBuyRate() : BigDecimal.ZERO;
            BigDecimal bagWeight = (entry.getValue() != null && entry.getValue().getBagWeight() != null) ? entry.getValue().getBagWeight() : BigDecimal.valueOf(101.0);

            Optional<DailyRate> latestOpt = dailyRateRepository.findTopByCropTypeOrderByDateDesc(crop);

            if (latestOpt.isPresent()) {
                DailyRate latest = latestOpt.get();
                if (latest.getDate().equals(today)) {
                    // Update today's rate
                    latest.setBuyRate(buyRate);
                    latest.setBagWeight(bagWeight);
                    dailyRateRepository.save(latest);
                } else {
                    // Create new rate for today
                    DailyRate newRate = new DailyRate();
                    newRate.setCropType(crop);
                    newRate.setDate(today);
                    newRate.setBuyRate(buyRate);
                    newRate.setBagWeight(bagWeight);
                    dailyRateRepository.save(newRate);
                }
            } else {
                // No rate exists yet, create first one
                DailyRate newRate = new DailyRate();
                newRate.setCropType(crop);
                newRate.setDate(today);
                newRate.setBuyRate(buyRate);
                newRate.setBagWeight(bagWeight);
                dailyRateRepository.save(newRate);
            }
        }
    }

}
