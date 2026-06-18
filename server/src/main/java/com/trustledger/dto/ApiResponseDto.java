package com.trustledger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponseDto<T> {
    private int status;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public ApiResponseDto(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponseDto<T> success(int status, String message, T data) {
        return new ApiResponseDto<>(status, message, data);
    }

    public static ApiResponseDto<Object> error(int status, String message, Object error) {
        return new ApiResponseDto<>(status, message, error);
    }
}
