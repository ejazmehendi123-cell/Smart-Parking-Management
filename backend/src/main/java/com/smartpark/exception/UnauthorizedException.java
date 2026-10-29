package com.smartpark.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends SmartParkException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.FORBIDDEN, "UNAUTHORIZED");
    }
}
