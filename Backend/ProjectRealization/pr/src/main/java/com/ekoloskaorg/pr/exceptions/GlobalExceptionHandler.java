package com.ekoloskaorg.pr.exceptions;

import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleDataAccess(DataAccessException ex) {
        Throwable cause = ex.getCause();
        if (cause instanceof SQLException sql) {
            if (sql.getErrorCode() == 20001) {
                return ResponseEntity.badRequest().body(sql.getMessage()); 
            }
        }
        return ResponseEntity.internalServerError().body("Database error");
    }
}
