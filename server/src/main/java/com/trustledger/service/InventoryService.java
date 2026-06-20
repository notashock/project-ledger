package com.trustledger.service;

import com.trustledger.dto.*;
import com.trustledger.model.BulkPurchase;
import com.trustledger.model.CropPurchase;
import com.trustledger.model.Godown;
import com.trustledger.model.InventoryLog;
import com.trustledger.model.enums.CropType;
import com.trustledger.model.enums.InventoryUnit;
import com.trustledger.model.enums.SourceType;
import com.trustledger.repository.BulkPurchaseRepository;
import com.trustledger.repository.GodownRepository;
import com.trustledger.repository.InventoryLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.trustledger.exception.GodownNotFoundException;
import com.trustledger.repository.FarmerRepository;
import com.trustledger.model.Farmer;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;
import com.trustledger.repository.CropPurchaseRepository;
import com.trustledger.service.MarketRateService;
import com.trustledger.security.AuthUtil;
import com.trustledger.model.AppUser;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final GodownRepository godownRepository;
    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final CropPurchaseRepository cropPurchaseRepository;
    private final MarketRateService marketRateService;
    private final FarmerRepository farmerRepository;
    private final AuthUtil authUtil;

    @Transactional
    public GodownDto addGodown(GodownDto request) {
        Godown godown = new Godown();
        godown.setUser(authUtil.getCurrentUser());
        godown.setName(request.getName());
        godown.setLocation(request.getLocation());
        Godown saved = godownRepository.save(godown);
        
        request.setId(saved.getId());
        return request;
    }

    @Transactional(readOnly = true)
    public List<GodownDto> getAllGodowns() {
        return godownRepository.findByUser(authUtil.getCurrentUser()).stream().map(g -> {
            GodownDto dto = new GodownDto();
            dto.setId(g.getId());
            dto.setName(g.getName());
            dto.setLocation(g.getLocation());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void logFarmerPurchase(CropPurchase purchase) {
        if (purchase.getGodown() == null) {
            throw new IllegalArgumentException("Godown must be specified for crop purchase");
        }

        InventoryLog log = new InventoryLog();
        log.setUser(authUtil.getCurrentUser());
        log.setGodown(purchase.getGodown());
        log.setDate(purchase.getDate());
        log.setSourceType(SourceType.FARMER_PURCHASE);
        log.setCropType(purchase.getCropType());
        log.setQuantity(purchase.getWeight());
        log.setUnit(InventoryUnit.KG);
        log.setReferenceId(purchase.getId());
        log.setNotes(purchase.getRemarks());
        
        inventoryLogRepository.save(log);
    }

    @Transactional
    public BulkPurchaseDto logBulkPurchase(BulkPurchaseDto dto) {
        AppUser currentUser = authUtil.getCurrentUser();
        Godown godown = godownRepository.findByIdAndUser(dto.getGodownId(), currentUser)
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + dto.getGodownId() + " not found"));

        BulkPurchase purchase = new BulkPurchase();
        purchase.setUser(currentUser);
        purchase.setSupplierName(dto.getSupplierName());
        purchase.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        purchase.setCropType(dto.getCropType());
        purchase.setWeight(dto.getWeight());
        purchase.setRatePerQuintal(dto.getRatePerQuintal());
        
        // Calculate amountSpent = (weight / 100) * ratePerQuintal
        if (dto.getWeight() != null && dto.getRatePerQuintal() != null) {
            BigDecimal amountSpent = dto.getWeight()
                    .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                    .multiply(dto.getRatePerQuintal())
                    .setScale(2, RoundingMode.HALF_UP);
            purchase.setAmountSpent(amountSpent);
        } else {
            purchase.setAmountSpent(BigDecimal.ZERO);
        }
        
        purchase.setBagWeight(dto.getBagWeight());
        purchase.setNoOfBags(dto.getNoOfBags());
        purchase.setGodown(godown);
        
        BulkPurchase saved = bulkPurchaseRepository.save(purchase);
        
        InventoryLog log = new InventoryLog();
        log.setUser(currentUser);
        log.setGodown(godown);
        log.setDate(saved.getDate());
        log.setSourceType(SourceType.BULK_BUY);
        log.setCropType(saved.getCropType());
        log.setQuantity(saved.getWeight());
        log.setUnit(InventoryUnit.KG);
        log.setReferenceId(saved.getId());
        log.setNotes("Bulk purchase from " + saved.getSupplierName());
        
        inventoryLogRepository.save(log);
        
        dto.setId(saved.getId());
        dto.setAmountSpent(saved.getAmountSpent());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<InventorySummaryDto> getInventorySummary() {
        return inventoryLogRepository.getInventorySummaryAndUser(authUtil.getCurrentUser());
    }

    @Transactional(readOnly = true)
    public List<InventoryTraceDto> getInventoryTrace(CropType cropType) {
        AppUser currentUser = authUtil.getCurrentUser();
        List<InventoryLog> logs = inventoryLogRepository.findByCropTypeAndUserOrderByDateDesc(cropType, currentUser);
        
        return logs.stream().map(log -> InventoryTraceDto.builder()
                .id(log.getId())
                .date(log.getDate())
                .godownName(log.getGodown() != null ? log.getGodown().getName() : "Unknown")
                .cropType(log.getCropType())
                .sourceType(log.getSourceType())
                .quantity(log.getQuantity())
                .referenceId(log.getReferenceId())
                .notes(log.getNotes())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GodownDetailsDto getGodownDetails(UUID godownId) {
        AppUser currentUser = authUtil.getCurrentUser();
        Godown godown = godownRepository.findByIdAndUser(godownId, currentUser)
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + godownId + " not found"));

        GodownDto godownDto = new GodownDto();
        godownDto.setId(godown.getId());
        godownDto.setName(godown.getName());
        godownDto.setLocation(godown.getLocation());

        List<CropPurchase> cropPurchases = cropPurchaseRepository.findByGodownIdAndUserOrderByDateDesc(godownId, currentUser);
        List<BulkPurchase> bulkPurchases = bulkPurchaseRepository.findByGodownIdAndUserOrderByDateDesc(godownId, currentUser);

        List<PurchaseItemDto> purchases = new ArrayList<>();
        Map<String, CropStockDetailDto> cropStocks = new HashMap<>();

        Map<String, CropRateDto> latestRates = marketRateService.getLatestRates();

        BigDecimal totalEstimatedValue = BigDecimal.ZERO;
        BigDecimal totalInvestedValue = BigDecimal.ZERO;

        for (CropType type : CropType.values()) {
            CropStockDetailDto stockDetail = new CropStockDetailDto();
            stockDetail.setTotalWeight(BigDecimal.ZERO);
            stockDetail.setApproxBags(BigDecimal.ZERO);
            stockDetail.setInvestedValue(BigDecimal.ZERO);
            stockDetail.setEstimatedValue(BigDecimal.ZERO);
            cropStocks.put(type.getValue().toUpperCase(), stockDetail);
        }

        // Process Crop Purchases
        for (CropPurchase cp : cropPurchases) {
            PurchaseItemDto item = new PurchaseItemDto();
            item.setId(cp.getId());
            item.setDate(cp.getDate());
            item.setSourceType("FARMER");
            item.setSupplierName(cp.getFarmer() != null ? cp.getFarmer().getName() : "Unknown");
            item.setCropType(cp.getCropType());
            item.setWeight(cp.getWeight());
            item.setNoOfBags(cp.getNoOfBags());
            item.setAmountSpent(cp.getTotalValue());
            item.setBagWeight(cp.getBagWeight());
            item.setRateApplied(cp.getRateApplied());
            item.setMachineCost(cp.getMachineCost());
            item.setRemarks(cp.getRemarks());
            item.setGodownId(cp.getGodown() != null ? cp.getGodown().getId() : null);
            item.setFarmerId(cp.getFarmer() != null ? cp.getFarmer().getId() : null);
            purchases.add(item);

            String cropKey = cp.getCropType().getValue().toUpperCase();
            CropStockDetailDto stockDetail = cropStocks.get(cropKey);
            stockDetail.setTotalWeight(stockDetail.getTotalWeight().add(cp.getWeight() != null ? cp.getWeight() : BigDecimal.ZERO));
            
            // Calculate bags using the bagWeight stored in the purchase itself
            BigDecimal bagWeight = cp.getBagWeight();
            if (bagWeight == null || bagWeight.compareTo(BigDecimal.ZERO) <= 0) {
                bagWeight = BigDecimal.valueOf(101.0);
            }
            BigDecimal bags = cp.getWeight() != null ? cp.getWeight().divide(bagWeight, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal remainder = bags.remainder(BigDecimal.ONE);
            if (remainder.compareTo(BigDecimal.valueOf(0.90)) > 0) {
                bags = bags.setScale(0, RoundingMode.CEILING);
            } else {
                bags = bags.setScale(2, RoundingMode.HALF_UP);
            }
            
            stockDetail.setApproxBags(stockDetail.getApproxBags().add(bags));
            stockDetail.setInvestedValue(stockDetail.getInvestedValue().add(cp.getTotalValue() != null ? cp.getTotalValue() : BigDecimal.ZERO));

            // Estimate value purely based on the daily_rates (latest buy rate)
            CropRateDto rateDto = latestRates.get(cropKey.toLowerCase());
            if (rateDto != null && rateDto.getBuyRate() != null) {
                BigDecimal estimatedValue = bags.multiply(rateDto.getBuyRate()).setScale(2, RoundingMode.HALF_UP);
                stockDetail.setEstimatedValue(stockDetail.getEstimatedValue().add(estimatedValue));
            }
        }

        // Process Bulk Purchases
        for (BulkPurchase bp : bulkPurchases) {
            PurchaseItemDto item = new PurchaseItemDto();
            item.setId(bp.getId());
            item.setDate(bp.getDate());
            item.setSourceType("BULK");
            item.setSupplierName(bp.getSupplierName());
            item.setCropType(bp.getCropType());
            item.setWeight(bp.getWeight());
            item.setNoOfBags(bp.getNoOfBags());
            item.setAmountSpent(bp.getAmountSpent());
            item.setBagWeight(bp.getBagWeight());
            item.setRatePerQuintal(bp.getRatePerQuintal());
            item.setGodownId(bp.getGodown() != null ? bp.getGodown().getId() : null);
            purchases.add(item);

            String cropKey = bp.getCropType().getValue().toUpperCase();
            CropStockDetailDto stockDetail = cropStocks.get(cropKey);
            stockDetail.setTotalWeight(stockDetail.getTotalWeight().add(bp.getWeight() != null ? bp.getWeight() : BigDecimal.ZERO));
            
            // Calculate bags using the bagWeight stored in the purchase itself
            BigDecimal bagWeight = bp.getBagWeight();
            if (bagWeight == null || bagWeight.compareTo(BigDecimal.ZERO) <= 0) {
                bagWeight = BigDecimal.valueOf(101.0);
            }
            BigDecimal bags = bp.getWeight() != null ? bp.getWeight().divide(bagWeight, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal remainder = bags.remainder(BigDecimal.ONE);
            if (remainder.compareTo(BigDecimal.valueOf(0.90)) > 0) {
                bags = bags.setScale(0, RoundingMode.CEILING);
            } else {
                bags = bags.setScale(2, RoundingMode.HALF_UP);
            }
            
            stockDetail.setApproxBags(stockDetail.getApproxBags().add(bags));
            stockDetail.setInvestedValue(stockDetail.getInvestedValue().add(bp.getAmountSpent() != null ? bp.getAmountSpent() : BigDecimal.ZERO));

            // Estimate value purely based on the daily_rates (latest buy rate)
            CropRateDto rateDto = latestRates.get(cropKey.toLowerCase());
            if (rateDto != null && rateDto.getBuyRate() != null) {
                BigDecimal estimatedValue = bags.multiply(rateDto.getBuyRate()).setScale(2, RoundingMode.HALF_UP);
                stockDetail.setEstimatedValue(stockDetail.getEstimatedValue().add(estimatedValue));
            }
        }

        // Sum up total estimated and invested values
        for (Map.Entry<String, CropStockDetailDto> entry : cropStocks.entrySet()) {
            CropStockDetailDto stockDetail = entry.getValue();
            totalEstimatedValue = totalEstimatedValue.add(stockDetail.getEstimatedValue());
            totalInvestedValue = totalInvestedValue.add(stockDetail.getInvestedValue());
        }

        purchases.sort((p1, p2) -> p2.getDate().compareTo(p1.getDate()));

        GodownDetailsDto details = new GodownDetailsDto();
        details.setGodown(godownDto);
        details.setCropStocks(cropStocks);
        details.setPurchases(purchases);
        details.setTotalEstimatedValue(totalEstimatedValue);
        details.setTotalInvestedValue(totalInvestedValue);

        return details;
    }

    @Transactional
    public GodownDto updateGodown(UUID id, GodownDto updatedGodown) {
        AppUser currentUser = authUtil.getCurrentUser();
        Godown existing = godownRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + id + " not found"));
        existing.setName(updatedGodown.getName());
        existing.setLocation(updatedGodown.getLocation());
        godownRepository.save(existing);
        updatedGodown.setId(existing.getId());
        return updatedGodown;
    }

    @Transactional
    public void deleteGodown(UUID id) {
        AppUser currentUser = authUtil.getCurrentUser();
        Godown godown = godownRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + id + " not found"));

        // Check if godown currently holds active inventory
        BigDecimal sum = inventoryLogRepository.sumQuantityByGodownIdAndUser(id, currentUser);
        if (sum != null && sum.compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Cannot delete Godown holding active inventory");
        }

        // Delete associated inventory logs
        List<InventoryLog> logs = inventoryLogRepository.findByGodownIdAndUser(id, currentUser);
        inventoryLogRepository.deleteAll(logs);

        // Delete associated crop purchases (and update farmer balances)
        List<CropPurchase> purchases = cropPurchaseRepository.findByGodownIdAndUserOrderByDateDesc(id, currentUser);
        for (CropPurchase purchase : purchases) {
            Farmer farmer = purchase.getFarmer();
            if (farmer != null) {
                farmer.setNetBalance(farmer.getNetBalance().subtract(purchase.getTotalValue()));
                farmerRepository.save(farmer);
            }
        }
        cropPurchaseRepository.deleteAll(purchases);

        // Delete associated bulk purchases
        List<BulkPurchase> bulkPurchases = bulkPurchaseRepository.findByGodownIdAndUserOrderByDateDesc(id, currentUser);
        bulkPurchaseRepository.deleteAll(bulkPurchases);

        // Delete the godown
        godownRepository.delete(godown);
    }

    @Transactional
    public BulkPurchaseDto updateBulkPurchase(UUID id, BulkPurchaseDto dto) {
        AppUser currentUser = authUtil.getCurrentUser();
        BulkPurchase purchase = bulkPurchaseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Bulk purchase with ID " + id + " not found"));

        Godown godown = godownRepository.findByIdAndUser(dto.getGodownId(), currentUser)
                .orElseThrow(() -> new GodownNotFoundException("Godown with ID " + dto.getGodownId() + " not found"));

        purchase.setSupplierName(dto.getSupplierName());
        purchase.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        purchase.setCropType(dto.getCropType());
        purchase.setWeight(dto.getWeight());
        purchase.setRatePerQuintal(dto.getRatePerQuintal());

        // Calculate amountSpent = (weight / 100) * ratePerQuintal
        if (dto.getWeight() != null && dto.getRatePerQuintal() != null) {
            BigDecimal amountSpent = dto.getWeight()
                    .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                    .multiply(dto.getRatePerQuintal())
                    .setScale(2, RoundingMode.HALF_UP);
            purchase.setAmountSpent(amountSpent);
        } else {
            purchase.setAmountSpent(BigDecimal.ZERO);
        }

        purchase.setBagWeight(dto.getBagWeight());
        purchase.setNoOfBags(dto.getNoOfBags());
        purchase.setGodown(godown);

        BulkPurchase saved = bulkPurchaseRepository.save(purchase);

        // Update corresponding InventoryLog entry
        List<InventoryLog> logs = inventoryLogRepository.findByReferenceId(saved.getId());
        for (InventoryLog log : logs) {
            log.setGodown(godown);
            log.setDate(saved.getDate());
            log.setCropType(saved.getCropType());
            if (log.getQuantity().compareTo(BigDecimal.ZERO) >= 0) {
                log.setQuantity(saved.getWeight());
            } else {
                log.setQuantity(saved.getWeight().negate());
            }
            log.setNotes("Bulk purchase from " + saved.getSupplierName());
            inventoryLogRepository.save(log);
        }

        dto.setId(saved.getId());
        dto.setAmountSpent(saved.getAmountSpent());
        return dto;
    }
}
