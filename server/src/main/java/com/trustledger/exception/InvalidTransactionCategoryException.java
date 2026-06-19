package com.trustledger.exception;

public class InvalidTransactionCategoryException extends RuntimeException {
    public InvalidTransactionCategoryException(String message) {
        super(message);
    }
}
