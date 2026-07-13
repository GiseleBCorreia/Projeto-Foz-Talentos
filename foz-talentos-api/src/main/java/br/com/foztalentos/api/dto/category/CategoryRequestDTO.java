package br.com.foztalentos.api.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequestDTO(

        @NotBlank
        String name

) {}
