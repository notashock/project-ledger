package com.trustledger.controller;

import com.trustledger.dto.ApiResponseDto;
import com.trustledger.service.MarketRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

import com.trustledger.dto.InventoryItemDto;
import com.trustledger.dto.CropRateDto;
import com.trustledger.model.DailyRate;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MarketRateController {

    private final MarketRateService marketRateService;

    @GetMapping("/rates")
    public ResponseEntity<ApiResponseDto<Map<String, CropRateDto>>> getLatestRates() {
        ApiResponseDto<Map<String, CropRateDto>> response = ApiResponseDto.success(
                202,
                "Latest market rates retrieved successfully",
                marketRateService.getLatestRates()
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @GetMapping("/rates/history")
    public ResponseEntity<ApiResponseDto<Map<String, List<DailyRate>>>> getRatesHistory() {
        ApiResponseDto<Map<String, List<DailyRate>>> response = ApiResponseDto.success(
                202,
                "Market rates history retrieved successfully",
                marketRateService.getRatesHistory()
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/rates")
    public ResponseEntity<ApiResponseDto<Void>> updateRates(@RequestBody Map<String, CropRateDto> rates) {
        marketRateService.updateRates(rates);
        ApiResponseDto<Void> response = ApiResponseDto.success(
                202,
                "Market rates updated successfully",
                null
        );
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }
}
