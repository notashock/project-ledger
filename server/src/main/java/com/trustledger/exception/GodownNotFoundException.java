package com.trustledger.exception;

public class GodownNotFoundException extends RuntimeException {
    public GodownNotFoundException(String message) {
        super(message);
    }
}
