package com.trustledger.controller;

import com.trustledger.dto.ApiResponseDto;
import com.trustledger.dto.BulkPurchaseDto;
import com.trustledger.dto.GodownDto;
import com.trustledger.dto.InventorySummaryDto;
import com.trustledger.dto.InventoryTraceDto;
import com.trustledger.model.enums.CropType;
import com.trustledger.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<List<InventorySummaryDto>>> getInventorySummary() {
        ApiResponseDto<List<InventorySummaryDto>> response = ApiResponseDto.success(
                202,
                "Inventory summary retrieved successfully",
                inventoryService.getInventorySummary()
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/trace/{cropType}")
    public ResponseEntity<ApiResponseDto<List<InventoryTraceDto>>> getInventoryTrace(@PathVariable CropType cropType) {
        ApiResponseDto<List<InventoryTraceDto>> response = ApiResponseDto.success(
                202,
                "Inventory trace retrieved successfully",
                inventoryService.getInventoryTrace(cropType)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/bulk-purchases")
    public ResponseEntity<ApiResponseDto<BulkPurchaseDto>> logBulkPurchase(@RequestBody BulkPurchaseDto dto) {
        ApiResponseDto<BulkPurchaseDto> response = ApiResponseDto.success(
                202,
                "Bulk purchase logged successfully",
                inventoryService.logBulkPurchase(dto)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/godowns")
    public ResponseEntity<ApiResponseDto<GodownDto>> addGodown(@RequestBody GodownDto dto) {
        ApiResponseDto<GodownDto> response = ApiResponseDto.success(
                202,
                "Godown created successfully",
                inventoryService.addGodown(dto)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/godowns")
    public ResponseEntity<ApiResponseDto<List<GodownDto>>> getAllGodowns() {
        ApiResponseDto<List<GodownDto>> response = ApiResponseDto.success(
                202,
                "Godowns retrieved successfully",
                inventoryService.getAllGodowns()
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/godowns/{id}/details")
    public ResponseEntity<ApiResponseDto<com.trustledger.dto.GodownDetailsDto>> getGodownDetails(@PathVariable java.util.UUID id) {
        ApiResponseDto<com.trustledger.dto.GodownDetailsDto> response = ApiResponseDto.success(
                202,
                "Godown details retrieved successfully",
                inventoryService.getGodownDetails(id)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PutMapping("/godowns/{id}")
    public ResponseEntity<ApiResponseDto<GodownDto>> updateGodown(
            @PathVariable("id") java.util.UUID id,
            @RequestBody GodownDto godownDto) {
        ApiResponseDto<GodownDto> response = ApiResponseDto.success(
                202,
                "Godown updated successfully",
                inventoryService.updateGodown(id, godownDto)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/godowns/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteGodown(@PathVariable("id") java.util.UUID id) {
        inventoryService.deleteGodown(id);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                202,
                "Godown deleted successfully",
                null
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PutMapping("/bulk-purchases/{id}")
    public ResponseEntity<ApiResponseDto<BulkPurchaseDto>> updateBulkPurchase(
            @PathVariable("id") java.util.UUID id,
            @RequestBody BulkPurchaseDto dto) {
        ApiResponseDto<BulkPurchaseDto> response = ApiResponseDto.success(
                202,
                "Bulk purchase updated successfully",
                inventoryService.updateBulkPurchase(id, dto)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}
