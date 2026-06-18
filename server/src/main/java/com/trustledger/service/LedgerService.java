package com.trustledger.service;

import com.trustledger.dto.DebitRequestDto;
import com.trustledger.dto.PurchaseRequestDto;
import com.trustledger.dto.TransactionHistoryDto;
import com.trustledger.dto.TransactionItemDto;
import com.trustledger.model.CropPurchase;
import com.trustledger.model.DailyRate;
import com.trustledger.model.Farmer;
import com.trustledger.model.LedgerDebit;
import com.trustledger.model.enums.CropType;
import com.trustledger.repository.CropPurchaseRepository;
import com.trustledger.repository.DailyRateRepository;
import com.trustledger.repository.FarmerRepository;
import com.trustledger.repository.LedgerDebitRepository;
import com.trustledger.repository.GodownRepository;
import com.trustledger.model.Godown;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final FarmerRepository farmerRepository;
    private final CropPurchaseRepository cropPurchaseRepository;
    private final LedgerDebitRepository ledgerDebitRepository;
    private final DailyRateRepository dailyRateRepository;
    private final GodownRepository godownRepository;
    private final InventoryService inventoryService;

    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    public Farmer getFarmerById(UUID id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));
    }

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        if (farmer.getNetBalance() == null) {
            farmer.setNetBalance(BigDecimal.ZERO);
        }
        return farmerRepository.save(farmer);
    }

    @Transactional
    public CropPurchase logPurchase(PurchaseRequestDto request) {
        if (request.getGodownId() == null) {
            throw new IllegalArgumentException("Godown ID is required");
        }
        Godown godown = godownRepository.findById(request.getGodownId())
                .orElseThrow(() -> new IllegalArgumentException("Godown not found"));

        Farmer farmer = getFarmerById(request.getFarmerId());

        CropPurchase purchase = new CropPurchase();
        purchase.setFarmer(farmer);
        purchase.setGodown(godown);
        purchase.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        purchase.setCropType(request.getCropType());
        purchase.setWeight(request.getWeight());
        purchase.setRateApplied(request.getRateApplied());
        purchase.setRemarks(request.getRemarks());

        BigDecimal bagWeight = request.getBagWeight();
        if (bagWeight == null || bagWeight.compareTo(BigDecimal.ZERO) <= 0) {
            bagWeight = dailyRateRepository.findByCropTypeAndDate(request.getCropType(), purchase.getDate())
                .map(DailyRate::getBagWeight)
                .orElseGet(() -> dailyRateRepository.findTopByCropTypeOrderByDateDesc(request.getCropType())
                    .map(DailyRate::getBagWeight)
                    .orElse(BigDecimal.valueOf(101.0)));
        }
        purchase.setBagWeight(bagWeight);

        BigDecimal noOfBags = request.getNoOfBags();
        if (noOfBags == null || noOfBags.compareTo(BigDecimal.ZERO) <= 0) {
            if (purchase.getWeight() != null && bagWeight.compareTo(BigDecimal.ZERO) > 0) {
                noOfBags = purchase.getWeight().divide(bagWeight, 4, java.math.RoundingMode.HALF_UP);
            } else {
                noOfBags = BigDecimal.ZERO;
            }
        }
        
        // Rounding rule: if fractional part is > 0.90, round up to ceiling
        BigDecimal remainder = noOfBags.remainder(BigDecimal.ONE);
        if (remainder.compareTo(BigDecimal.valueOf(0.90)) > 0) {
            noOfBags = noOfBags.setScale(0, java.math.RoundingMode.CEILING);
        }
        purchase.setNoOfBags(noOfBags);

        if (purchase.getWeight() == null || purchase.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
            purchase.setWeight(noOfBags.multiply(bagWeight));
        }

        BigDecimal machineCost = request.getMachineCost();
        if (machineCost == null) {
            BigDecimal machineBags = noOfBags.setScale(0, java.math.RoundingMode.FLOOR);
            machineCost = machineBags.multiply(BigDecimal.valueOf(110.0));
        }
        purchase.setMachineCost(machineCost);

        BigDecimal total = request.getTotalValue();
        if (total == null) {
            if (purchase.getRateApplied() != null) {
                BigDecimal gross = noOfBags.multiply(purchase.getRateApplied());
                total = gross.subtract(machineCost);
            } else {
                total = BigDecimal.ZERO;
            }
        }
        purchase.setTotalValue(total);

        farmer.setNetBalance(farmer.getNetBalance().add(purchase.getTotalValue()));
        farmerRepository.save(farmer);

        CropPurchase savedPurchase = cropPurchaseRepository.save(purchase);

        // Auto-update daily rate for this crop and date based on updateDailyRate flag
        LocalDate purchaseDate = savedPurchase.getDate();
        CropType crop = savedPurchase.getCropType();
        BigDecimal rateApplied = savedPurchase.getRateApplied();

        if (crop != null && rateApplied != null) {
            java.util.Optional<DailyRate> rateOpt = dailyRateRepository.findByCropTypeAndDate(crop, purchaseDate);
            boolean shouldUpdate = true;
            if (request.getUpdateDailyRate() != null) {
                shouldUpdate = request.getUpdateDailyRate();
            }

            if (shouldUpdate) {
                if (rateOpt.isPresent()) {
                    DailyRate existingRate = rateOpt.get();
                    existingRate.setBuyRate(rateApplied);
                    existingRate.setBagWeight(bagWeight);
                    dailyRateRepository.save(existingRate);
                } else {
                    DailyRate newRate = new DailyRate();
                    newRate.setCropType(crop);
                    newRate.setDate(purchaseDate);
                    newRate.setBuyRate(rateApplied);
                    newRate.setBagWeight(bagWeight);
                    dailyRateRepository.save(newRate);
                }
            }
        }

        inventoryService.logFarmerPurchase(savedPurchase);

        return savedPurchase;
    }

    @Transactional
    public LedgerDebit logDebit(DebitRequestDto request) {
        Farmer farmer = getFarmerById(request.getFarmerId());

        LedgerDebit debit = new LedgerDebit();
        debit.setFarmer(farmer);
        debit.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        debit.setCategory(request.getCategory());
        debit.setCostAmount(request.getCostAmount());
        debit.setDescription(request.getDescription());

        farmer.setNetBalance(farmer.getNetBalance().subtract(debit.getCostAmount()));
        farmerRepository.save(farmer);

        return ledgerDebitRepository.save(debit);
    }

    @Transactional(readOnly = true)
    public TransactionHistoryDto getFarmerTransactionHistory(UUID farmerId, String query) {
        Farmer farmer = getFarmerById(farmerId);

        List<CropPurchase> purchases = cropPurchaseRepository.findByFarmerIdOrderByDateDesc(farmerId);
        List<LedgerDebit> debits = ledgerDebitRepository.findByFarmerIdOrderByDateDesc(farmerId);

        List<TransactionItemDto> items = new ArrayList<>();

        for (CropPurchase p : purchases) {
            String remarksText = (p.getRemarks() != null && !p.getRemarks().trim().isEmpty()) ? " (" + p.getRemarks() + ")" : "";
            String weightDesc;
            if (p.getNoOfBags() != null && p.getBagWeight() != null) {
                BigDecimal roundedBags = p.getNoOfBags().setScale(2, java.math.RoundingMode.HALF_UP);
                weightDesc = roundedBags + " bags (" + p.getWeight() + " kg)";
            } else {
                weightDesc = p.getWeight() + " kg";
            }

            String machineCostDesc = "";
            if (p.getMachineCost() != null && p.getMachineCost().compareTo(BigDecimal.ZERO) > 0) {
                machineCostDesc = " [Machine Cost: ₹" + p.getMachineCost().setScale(2, java.math.RoundingMode.HALF_UP) + "]";
            }

            items.add(TransactionItemDto.builder()
                    .id(p.getId())
                    .date(p.getDate())
                    .type("PURCHASE")
                    .description("Bought " + (p.getCropType() != null ? p.getCropType().getValue() : "") + " - " + weightDesc + machineCostDesc + remarksText)
                    .amount(p.getTotalValue())
                    .sign("+")
                    .build());
        }

        for (LedgerDebit d : debits) {
            items.add(TransactionItemDto.builder()
                    .id(d.getId())
                    .date(d.getDate())
                    .type("DEBIT")
                    .description(d.getCategory().name() + " - " + (d.getDescription() != null ? d.getDescription() : ""))
                    .amount(d.getCostAmount())
                    .sign("-")
                    .build());
        }

        if (query != null && !query.trim().isEmpty()) {
            String q = query.toLowerCase();
            items = items.stream().filter(item -> {
                String typeLabel = item.getType().equals("PURCHASE") ? "crop purchase" : "advance material";
                String dateStr = item.getDate().toString();
                return (item.getDescription() != null && item.getDescription().toLowerCase().contains(q)) ||
                       (item.getAmount() != null && item.getAmount().toString().contains(q)) ||
                       typeLabel.contains(q) ||
                       dateStr.contains(q);
            }).collect(java.util.stream.Collectors.toList());
        }

        // Sort unified list descending by date
        items.sort(Comparator.comparing(TransactionItemDto::getDate).reversed());

        return TransactionHistoryDto.builder()
                .farmerName(farmer.getName())
                .netBalance(farmer.getNetBalance())
                .transactions(items)
                .build();
    }
}
