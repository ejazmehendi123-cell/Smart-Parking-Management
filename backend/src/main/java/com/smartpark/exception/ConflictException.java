package com.smartpark.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends SmartParkException {
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, "CONFLICT");
    }
}
