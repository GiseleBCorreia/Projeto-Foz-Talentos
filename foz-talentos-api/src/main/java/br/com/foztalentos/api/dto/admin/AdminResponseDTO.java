package br.com.foztalentos.api.dto.admin;

import java.time.LocalDateTime;

public record AdminResponseDTO(

        Long id,
        String name,
        String email,
        @jakarta.validation.constraints.NotNull Enum role,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
