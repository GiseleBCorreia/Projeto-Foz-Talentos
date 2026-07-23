package br.com.foztalentos.api.dto.admin;

import br.com.foztalentos.api.enums.Role;

import java.time.LocalDateTime;

public record AdminResponseDTO(

        Long id,
        String name,
        String email,
        Role role,
        Boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
