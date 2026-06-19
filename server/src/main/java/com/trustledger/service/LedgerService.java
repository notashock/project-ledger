package com.trustledger.service;

import com.trustledger.dto.DebitRequestDto;
import com.trustledger.dto.PurchaseRequestDto;
import com.trustledger.dto.TransactionHistoryDto;
import com.trustledger.dto.TransactionItemDto;
import com.trustledger.model.CropPurchase;
import com.trustledger.model.DailyRate;
import com.trustledger.model.Farmer;
import com.trustledger.model.LedgerDebit;
import com.trustledger.model.InventoryLog;
import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.SourceType;
import com.trustledger.model.enums.InventoryUnit;
import com.trustledger.repository.CropPurchaseRepository;
import com.trustledger.repository.DailyRateRepository;
import com.trustledger.repository.FarmerRepository;
import com.trustledger.repository.LedgerDebitRepository;
import com.trustledger.repository.GodownRepository;
import com.trustledger.repository.InventoryLogRepository;
import com.trustledger.model.Godown;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.trustledger.exception.FarmerNotFoundException;
import com.trustledger.exception.GodownNotFoundException;
import com.trustledger.exception.DuplicateResourceException;

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
    private final InventoryLogRepository inventoryLogRepository;

    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    public Farmer getFarmerById(UUID id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new FarmerNotFoundException("Farmer with ID " + id + " not found"));
    }

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        if (farmerRepository.findByNameAndVillage(farmer.getName(), farmer.getVillage()).isPresent()) {
            throw new DuplicateResourceException("Farmer '" + farmer.getName() + "' is already registered in village '" + farmer.getVillage() + "'");
        }
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
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + request.getGodownId() + " not found"));

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
        debit.setOtherCategorySpecify(request.getOtherCategorySpecify());

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
                    .cropType(p.getCropType() != null ? p.getCropType().getValue() : null)
                    .weight(p.getWeight())
                    .rateApplied(p.getRateApplied())
                    .bagWeight(p.getBagWeight())
                    .noOfBags(p.getNoOfBags())
                    .machineCost(p.getMachineCost())
                    .godownId(p.getGodown() != null ? p.getGodown().getId() : null)
                    .remarks(p.getRemarks())
                    .build());
        }

        for (LedgerDebit d : debits) {
            String categoryText = d.getCategory().name();
            if (d.getCategory() == com.trustledger.model.enums.DebitCategory.OTHER && d.getOtherCategorySpecify() != null && !d.getOtherCategorySpecify().trim().isEmpty()) {
                categoryText = categoryText + " (" + d.getOtherCategorySpecify() + ")";
            }
            items.add(TransactionItemDto.builder()
                    .id(d.getId())
                    .date(d.getDate())
                    .type("DEBIT")
                    .description(categoryText + " - " + (d.getDescription() != null ? d.getDescription() : ""))
                    .amount(d.getCostAmount())
                    .sign("-")
                    .category(d.getCategory() != null ? d.getCategory().name() : null)
                    .rawDescription(d.getDescription())
                    .otherCategorySpecify(d.getOtherCategorySpecify())
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
                .village(farmer.getVillage())
                .phone(farmer.getPhone())
                .netBalance(farmer.getNetBalance())
                .transactions(items)
                .build();
    }

    @Transactional
    public Farmer updateFarmer(UUID id, Farmer updatedFarmer) {
        Farmer existing = getFarmerById(id);
        existing.setName(updatedFarmer.getName());
        existing.setPhone(updatedFarmer.getPhone());
        existing.setVillage(updatedFarmer.getVillage());
        return farmerRepository.save(existing);
    }

    @Transactional
    public void deleteFarmer(UUID id) {
        Farmer farmer = getFarmerById(id);

        // Delete associated inventory logs for all crop purchases of this farmer
        List<CropPurchase> purchases = cropPurchaseRepository.findByFarmerIdOrderByDateDesc(id);
        for (CropPurchase purchase : purchases) {
            inventoryLogRepository.deleteByReferenceId(purchase.getId());
        }

        // Delete crop purchases
        cropPurchaseRepository.deleteAll(purchases);

        // Delete associated ledger debits
        List<LedgerDebit> debits = ledgerDebitRepository.findByFarmerIdOrderByDateDesc(id);
        ledgerDebitRepository.deleteAll(debits);

        // Delete the farmer
        farmerRepository.delete(farmer);
    }

    @Transactional
    public void deleteCropPurchase(UUID id) {
        CropPurchase purchase = cropPurchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Crop purchase with ID " + id + " not found"));

        Farmer farmer = purchase.getFarmer();
        if (farmer != null) {
            // Subtract totalValue back out of the Farmer's netBalance
            farmer.setNetBalance(farmer.getNetBalance().subtract(purchase.getTotalValue()));
            farmerRepository.save(farmer);
        }

        // Insert a reversing InventoryLog entry (negative quantity)
        InventoryLog reverseLog = new InventoryLog();
        reverseLog.setGodown(purchase.getGodown());
        reverseLog.setDate(LocalDate.now());
        reverseLog.setSourceType(SourceType.FARMER_PURCHASE);
        reverseLog.setCropType(purchase.getCropType());
        
        BigDecimal quantity = purchase.getWeight() != null ? purchase.getWeight() : BigDecimal.ZERO;
        reverseLog.setQuantity(quantity.negate());
        reverseLog.setUnit(InventoryUnit.KG);
        reverseLog.setReferenceId(purchase.getId());
        reverseLog.setNotes("Reversal: Purchase ID " + id + " deleted");

        inventoryLogRepository.save(reverseLog);

        // Delete the crop purchase
        cropPurchaseRepository.delete(purchase);
    }

    @Transactional
    public void deleteLedgerDebit(UUID id) {
        LedgerDebit debit = ledgerDebitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Debit record with ID " + id + " not found"));

        Farmer farmer = debit.getFarmer();
        if (farmer != null) {
            // Add costAmount back into the Farmer's netBalance
            farmer.setNetBalance(farmer.getNetBalance().add(debit.getCostAmount()));
            farmerRepository.save(farmer);
        }

        ledgerDebitRepository.delete(debit);
    }

    @Transactional
    public CropPurchase updateCropPurchase(UUID id, PurchaseRequestDto request) {
        CropPurchase purchase = cropPurchaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Crop purchase with ID " + id + " not found"));

        Farmer oldFarmer = purchase.getFarmer();
        BigDecimal oldTotalValue = purchase.getTotalValue();

        // 1. Subtract old total value from old farmer
        if (oldFarmer != null) {
            oldFarmer.setNetBalance(oldFarmer.getNetBalance().subtract(oldTotalValue));
            farmerRepository.save(oldFarmer);
        }

        // 2. Fetch new farmer and godown
        Farmer newFarmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new FarmerNotFoundException("Farmer with ID " + request.getFarmerId() + " not found"));
        Godown newGodown = godownRepository.findById(request.getGodownId())
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + request.getGodownId() + " not found"));

        purchase.setFarmer(newFarmer);
        purchase.setGodown(newGodown);
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

        // 3. Add new total value to new farmer
        newFarmer.setNetBalance(newFarmer.getNetBalance().add(purchase.getTotalValue()));
        farmerRepository.save(newFarmer);

        CropPurchase saved = cropPurchaseRepository.save(purchase);

        // 4. Update the corresponding InventoryLog entry
        List<InventoryLog> logs = inventoryLogRepository.findByReferenceId(saved.getId());
        for (InventoryLog log : logs) {
            log.setGodown(newGodown);
            log.setDate(saved.getDate());
            log.setCropType(saved.getCropType());
            if (log.getQuantity().compareTo(BigDecimal.ZERO) >= 0) {
                log.setQuantity(saved.getWeight());
            } else {
                log.setQuantity(saved.getWeight().negate());
            }
            log.setNotes(saved.getRemarks());
            inventoryLogRepository.save(log);
        }

        return saved;
    }

    @Transactional
    public LedgerDebit updateLedgerDebit(UUID id, DebitRequestDto request) {
        LedgerDebit debit = ledgerDebitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Debit record with ID " + id + " not found"));

        Farmer oldFarmer = debit.getFarmer();
        BigDecimal oldCostAmount = debit.getCostAmount();

        // 1. Add old costAmount back to old farmer
        if (oldFarmer != null) {
            oldFarmer.setNetBalance(oldFarmer.getNetBalance().add(oldCostAmount));
            farmerRepository.save(oldFarmer);
        }

        // 2. Fetch new farmer and update fields
        Farmer newFarmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new FarmerNotFoundException("Farmer with ID " + request.getFarmerId() + " not found"));

        debit.setFarmer(newFarmer);
        debit.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        debit.setCategory(request.getCategory());
        debit.setCostAmount(request.getCostAmount());
        debit.setDescription(request.getDescription());
        debit.setOtherCategorySpecify(request.getOtherCategorySpecify());

        // 3. Subtract new costAmount from new farmer
        newFarmer.setNetBalance(newFarmer.getNetBalance().subtract(debit.getCostAmount()));
        farmerRepository.save(newFarmer);

        return ledgerDebitRepository.save(debit);
    }
}
