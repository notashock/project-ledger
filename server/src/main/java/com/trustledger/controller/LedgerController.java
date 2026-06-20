package com.trustledger.controller;

import com.trustledger.dto.ApiResponseDto;
import com.trustledger.dto.DebitRequestDto;
import com.trustledger.dto.PurchaseRequestDto;
import com.trustledger.dto.TransactionHistoryDto;
import com.trustledger.dto.TransactionItemDto;
import com.trustledger.model.CropPurchase;
import com.trustledger.model.Farmer;
import com.trustledger.model.LedgerDebit;
import com.trustledger.service.LedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin("*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping("/farmers")
    public ResponseEntity<ApiResponseDto<List<Farmer>>> getAllFarmers() {
        ApiResponseDto<List<Farmer>> response = ApiResponseDto.success(
                202,
                "Farmers retrieved successfully",
                ledgerService.getAllFarmers()
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/farmers/{id}")
    public ResponseEntity<ApiResponseDto<Farmer>> getFarmerById(@PathVariable("id") UUID id) {
        ApiResponseDto<Farmer> response = ApiResponseDto.success(
                202,
                "Farmer details retrieved successfully",
                ledgerService.getFarmerById(id)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/farmers")
    public ResponseEntity<ApiResponseDto<Farmer>> createFarmer(@RequestBody Farmer farmer) {
        ApiResponseDto<Farmer> response = ApiResponseDto.success(
                202,
                "Farmer registered successfully",
                ledgerService.createFarmer(farmer)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/transactions/purchase")
    public ResponseEntity<ApiResponseDto<CropPurchase>> logPurchase(@RequestBody PurchaseRequestDto purchaseRequest) {
        ApiResponseDto<CropPurchase> response = ApiResponseDto.success(
                202,
                "Crop purchase logged successfully",
                ledgerService.logPurchase(purchaseRequest)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/transactions/debit")
    public ResponseEntity<ApiResponseDto<LedgerDebit>> logDebit(@RequestBody DebitRequestDto debitRequest) {
        ApiResponseDto<LedgerDebit> response = ApiResponseDto.success(
                202,
                "Deduction/debit logged successfully",
                ledgerService.logDebit(debitRequest)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/farmers/{id}/history")
    public ResponseEntity<ApiResponseDto<TransactionHistoryDto>> getFarmerTransactionHistory(
            @PathVariable("id") UUID id,
            @RequestParam(value = "query", required = false) String query) {
        ApiResponseDto<TransactionHistoryDto> response = ApiResponseDto.success(
                202,
                "Transaction history retrieved successfully",
                ledgerService.getFarmerTransactionHistory(id, query)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PutMapping("/farmers/{id}")
    public ResponseEntity<ApiResponseDto<Farmer>> updateFarmer(
            @PathVariable("id") UUID id,
            @RequestBody Farmer farmer) {
        ApiResponseDto<Farmer> response = ApiResponseDto.success(
                202,
                "Farmer details updated successfully",
                ledgerService.updateFarmer(id, farmer)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/farmers/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteFarmer(@PathVariable("id") UUID id) {
        ledgerService.deleteFarmer(id);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                202,
                "Farmer deleted successfully",
                null
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/transactions/purchase/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteCropPurchase(@PathVariable("id") UUID id) {
        ledgerService.deleteCropPurchase(id);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                202,
                "Crop purchase deleted successfully",
                null
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/transactions/debit/{id}")
    public ResponseEntity<ApiResponseDto<Void>> deleteLedgerDebit(@PathVariable("id") UUID id) {
        ledgerService.deleteLedgerDebit(id);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                202,
                "Ledger debit deleted successfully",
                null
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PutMapping("/transactions/purchase/{id}")
    public ResponseEntity<ApiResponseDto<CropPurchase>> updateCropPurchase(
            @PathVariable("id") UUID id,
            @RequestBody PurchaseRequestDto purchaseRequest) {
        ApiResponseDto<CropPurchase> response = ApiResponseDto.success(
                202,
                "Crop purchase updated successfully",
                ledgerService.updateCropPurchase(id, purchaseRequest)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PutMapping("/transactions/debit/{id}")
    public ResponseEntity<ApiResponseDto<LedgerDebit>> updateLedgerDebit(
            @PathVariable("id") UUID id,
            @RequestBody DebitRequestDto debitRequest) {
        ApiResponseDto<LedgerDebit> response = ApiResponseDto.success(
                202,
                "Ledger debit updated successfully",
                ledgerService.updateLedgerDebit(id, debitRequest)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/transactions/recent")
    public ResponseEntity<ApiResponseDto<List<TransactionItemDto>>> getRecentTransactions(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        ApiResponseDto<List<TransactionItemDto>> response = ApiResponseDto.success(
                202,
                "Recent transactions retrieved successfully",
                ledgerService.getRecentTransactions(limit)
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}
