package br.com.foztalentos.api.dto.health;

import java.time.LocalDateTime;

public record HealthResponseDTO(
        String status,
        LocalDateTime timestamp
) {}
