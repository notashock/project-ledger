package com.trustledger.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class GodownDto {
    private UUID id;
    private String name;
    private String location;
}
