package com.trustledger.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustledger.config.GeminiConfig;
import com.trustledger.dto.ExtractedDebitDto;
import com.trustledger.exception.GeminiIntegrationException;
import com.trustledger.exception.ReceiptParsingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiVisionService {

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public GeminiVisionService(GeminiConfig geminiConfig, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.geminiConfig = geminiConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<ExtractedDebitDto> extractReceiptData(String base64Image, String mimeType) {
        String apiKey = geminiConfig.getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("${GEMINI_API_KEY}")) {
            throw new GeminiIntegrationException("Gemini API Key is not configured on the server. Please check application.properties or environment variables.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> partsMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", "Analyze this receipt. Extract the farmer's name, the category, the cost, and any additional description.\n" +
                "For the category, if the item matches SEEDS, PESTICIDES, or CASH, return that exact word (SEEDS, PESTICIDES, or CASH).\n" +
                "If it does not fit these three, return only the specific name of the item or custom category (e.g., 'water', 'diesel', 'rent') as the category. " +
                "Do NOT prefix it with 'OTHER' or 'OTHER(specify the type)'.\n" +
                "The description must be empty (i.e., \"\") unless there is extra text/notes written on the receipt besides the item name and cost.\n" +
                "Return ONLY a valid JSON array matching this exact schema: [{\"farmerName\": \"...\", \"category\": \"SEEDS/PESTICIDES/CASH/custom_category\", \"costAmount\": 100.50, \"description\": \"...\"}]. Do not include markdown formatting like ```json.");
        parts.add(textPart);

        Map<String, Object> inlineDataPart = new HashMap<>();
        Map<String, String> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Image);
        inlineDataPart.put("inlineData", inlineData);
        parts.add(inlineDataPart);

        partsMap.put("parts", parts);
        contents.add(partsMap);
        requestBody.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.postForEntity(url, request, Map.class);
        } catch (HttpStatusCodeException e) {
            throw new GeminiIntegrationException("Gemini API responded with error " + e.getStatusCode() + ": " + e.getResponseBodyAsString(), e);
        } catch (RestClientException e) {
            throw new GeminiIntegrationException("Failed to communicate with Gemini API: " + e.getMessage(), e);
        }

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates == null || candidates.isEmpty()) {
                    throw new ReceiptParsingException("Gemini API returned a successful response, but no analysis candidates were generated.");
                }
                
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content == null) {
                    throw new ReceiptParsingException("Gemini API returned empty candidate content.");
                }
                
                List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                if (resParts == null || resParts.isEmpty()) {
                    throw new ReceiptParsingException("Gemini API candidate content did not contain any parts.");
                }
                
                String jsonText = (String) resParts.get(0).get("text");
                if (jsonText == null) {
                    throw new ReceiptParsingException("Gemini API content part did not contain any text.");
                }
                
                // Clean up markdown if Gemini still included it despite instructions
                jsonText = jsonText.trim();
                if (jsonText.startsWith("```json")) {
                    jsonText = jsonText.substring(7);
                }
                if (jsonText.startsWith("```")) {
                    jsonText = jsonText.substring(3);
                }
                if (jsonText.endsWith("```")) {
                    jsonText = jsonText.substring(0, jsonText.length() - 3);
                }
                jsonText = jsonText.trim();
                
                List<ExtractedDebitDto> dtos = objectMapper.readValue(jsonText, new TypeReference<List<ExtractedDebitDto>>() {});
                if (dtos != null) {
                    for (ExtractedDebitDto dto : dtos) {
                        // 1. Clean and normalize category
                        String cat = dto.getCategory();
                        if (cat != null) {
                            cat = cat.trim();
                            // If Gemini output it with OTHER(type) or OTHER - type, extract the inner type
                            if (cat.toLowerCase().startsWith("other(") && cat.endsWith(")")) {
                                cat = cat.substring(6, cat.length() - 1).trim();
                            } else if (cat.toLowerCase().startsWith("other - ")) {
                                cat = cat.substring(8).trim();
                            } else if (cat.toLowerCase().startsWith("other:")) {
                                cat = cat.substring(6).trim();
                            } else if (cat.equalsIgnoreCase("seeds")) {
                                cat = "SEEDS";
                            } else if (cat.equalsIgnoreCase("pesticides")) {
                                cat = "PESTICIDES";
                            } else if (cat.equalsIgnoreCase("cash")) {
                                cat = "CASH";
                            }
                            dto.setCategory(cat);
                        }

                        // 2. Clean and normalize description
                        String desc = dto.getDescription();
                        if (desc != null) {
                            desc = desc.trim();
                            // If description duplicates category, clear it
                            if (cat != null && desc.equalsIgnoreCase(cat)) {
                                desc = "";
                            }
                            dto.setDescription(desc);
                        } else {
                            dto.setDescription("");
                        }
                    }
                }
                return dtos;
            } catch (ReceiptParsingException e) {
                throw e;
            } catch (Exception e) {
                throw new ReceiptParsingException("Failed to parse extracted JSON array from Gemini API response: " + e.getMessage(), e);
            }
        }
        
        throw new GeminiIntegrationException("Failed to extract data from image: Received unexpected response status " + response.getStatusCode());
    }
}
