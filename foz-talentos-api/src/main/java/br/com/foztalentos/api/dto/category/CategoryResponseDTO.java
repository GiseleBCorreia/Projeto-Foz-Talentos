package br.com.foztalentos.api.dto.category;

import java.time.LocalDateTime;

public record CategoryResponseDTO(

        Long id,
        String name,
        Boolean active,
        LocalDateTime createdAt

) {}
