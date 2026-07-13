package br.com.foztalentos.api.dto.admin;

import java.time.LocalDateTime;

public record AdminResponseDTO(

        Long id,
        String name,
        String email,
        String role,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
