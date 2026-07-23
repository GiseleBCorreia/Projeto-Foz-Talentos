package br.com.foztalentos.api.exception;

import java.time.LocalDateTime;

public record ErrorResponse (

    LocalDateTime timestamp,
    Integer Status,
    String message,
    String path

    )
{}
