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

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final GodownRepository godownRepository;
    private final BulkPurchaseRepository bulkPurchaseRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final CropPurchaseRepository cropPurchaseRepository;
    private final MarketRateService marketRateService;

    @Transactional
    public GodownDto addGodown(GodownDto request) {
        Godown godown = new Godown();
        godown.setName(request.getName());
        godown.setLocation(request.getLocation());
        Godown saved = godownRepository.save(godown);
        
        request.setId(saved.getId());
        return request;
    }

    @Transactional(readOnly = true)
    public List<GodownDto> getAllGodowns() {
        return godownRepository.findAll().stream().map(g -> {
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
        Godown godown = godownRepository.findById(dto.getGodownId())
                .orElseThrow(() -> new IllegalArgumentException("Godown not found"));

        BulkPurchase purchase = new BulkPurchase();
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
        return inventoryLogRepository.getInventorySummary();
    }

    @Transactional(readOnly = true)
    public List<InventoryTraceDto> getInventoryTrace(CropType cropType) {
        List<InventoryLog> logs = inventoryLogRepository.findByCropTypeOrderByDateDesc(cropType);
        
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
        Godown godown = godownRepository.findById(godownId)
                .orElseThrow(() -> new IllegalArgumentException("Godown not found"));

        GodownDto godownDto = new GodownDto();
        godownDto.setId(godown.getId());
        godownDto.setName(godown.getName());
        godownDto.setLocation(godown.getLocation());

        List<CropPurchase> cropPurchases = cropPurchaseRepository.findByGodownIdOrderByDateDesc(godownId);
        List<BulkPurchase> bulkPurchases = bulkPurchaseRepository.findByGodownIdOrderByDateDesc(godownId);

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
            purchases.add(item);

            String cropKey = cp.getCropType().getValue().toUpperCase();
            CropStockDetailDto stockDetail = cropStocks.get(cropKey);
            stockDetail.setTotalWeight(stockDetail.getTotalWeight().add(cp.getWeight() != null ? cp.getWeight() : BigDecimal.ZERO));
            stockDetail.setApproxBags(stockDetail.getApproxBags().add(cp.getNoOfBags() != null ? cp.getNoOfBags() : BigDecimal.ZERO));
            stockDetail.setInvestedValue(stockDetail.getInvestedValue().add(cp.getTotalValue() != null ? cp.getTotalValue() : BigDecimal.ZERO));
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
            purchases.add(item);

            String cropKey = bp.getCropType().getValue().toUpperCase();
            CropStockDetailDto stockDetail = cropStocks.get(cropKey);
            stockDetail.setTotalWeight(stockDetail.getTotalWeight().add(bp.getWeight() != null ? bp.getWeight() : BigDecimal.ZERO));
            stockDetail.setApproxBags(stockDetail.getApproxBags().add(bp.getNoOfBags() != null ? bp.getNoOfBags() : BigDecimal.ZERO));
            stockDetail.setInvestedValue(stockDetail.getInvestedValue().add(bp.getAmountSpent() != null ? bp.getAmountSpent() : BigDecimal.ZERO));
        }

        // Calculate Estimated Cost
        for (Map.Entry<String, CropStockDetailDto> entry : cropStocks.entrySet()) {
            CropStockDetailDto stockDetail = entry.getValue();
            CropRateDto rateDto = latestRates.get(entry.getKey().toLowerCase());
            
            if (rateDto != null && rateDto.getBuyRate() != null && rateDto.getBagWeight() != null && rateDto.getBagWeight().compareTo(BigDecimal.ZERO) > 0) {
                // Calculation rule: Total Bags * Price per bag (where Price is buyRate, and buyRate is per bag if bagWeight is considered)
                // Wait, daily_rates stores buyRate which is price of 1 bag. The no. of bags is calculated based on bag weight.
                // The formula given by the user: "multiply the no.of bags with the price of this date".
                // And no.of bags was calculated by weight of each bag.
                // If the stock details already aggregated approxBags (which was computed during purchase), we just multiply it by buyRate.
                // BUT what if we want to calculate no.of bags dynamically from totalWeight? The user said "first you need to calculate the no.of bags with the same formula as the weight of each bag is stored in the table itself and multiply the no.of bags with the price of this date"
                
                // Let's recalculate noOfBags based on totalWeight / daily_rate.bagWeight to be strictly "purely based on daily_rates".
                // user: "first you need to calculate the no.of bags with the same formula as the weight of each bag is stored in the table itself and multiply the no.of bags with the price of this date"
                BigDecimal approxBags = stockDetail.getTotalWeight().divide(rateDto.getBagWeight(), 2, RoundingMode.HALF_UP);
                
                BigDecimal estimatedValue = approxBags.multiply(rateDto.getBuyRate()).setScale(2, RoundingMode.HALF_UP);
                stockDetail.setEstimatedValue(estimatedValue);
                stockDetail.setApproxBags(approxBags); // Update approxBags using the current daily rate bag weight to be precise.
            }

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
}
