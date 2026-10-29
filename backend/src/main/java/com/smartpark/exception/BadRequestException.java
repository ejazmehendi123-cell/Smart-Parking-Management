package com.smartpark.exception;

import org.springframework.http.HttpStatus;

public class BadRequestException extends SmartParkException {
    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "BAD_REQUEST");
    }
}
