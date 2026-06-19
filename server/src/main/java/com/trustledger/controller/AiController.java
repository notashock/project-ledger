package com.trustledger.controller;

import com.trustledger.dto.ExtractedDebitDto;
import com.trustledger.exception.InvalidImageException;
import com.trustledger.service.GeminiVisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final GeminiVisionService geminiVisionService;

    @Autowired
    public AiController(GeminiVisionService geminiVisionService) {
        this.geminiVisionService = geminiVisionService;
    }

    @PostMapping("/scan-debit")
    public ResponseEntity<List<ExtractedDebitDto>> scanDebitReceipt(@RequestParam("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new InvalidImageException("Uploaded receipt image is empty or missing.");
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidImageException("Unsupported file format. Please upload a valid image (e.g., PNG, JPEG).");
        }

        String base64Image;
        try {
            base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        } catch (IOException e) {
            throw new InvalidImageException("Failed to process the uploaded image file: " + e.getMessage());
        }

        List<ExtractedDebitDto> extractedData = geminiVisionService.extractReceiptData(base64Image, contentType);
        
        return ResponseEntity.ok(extractedData);
    }
}
