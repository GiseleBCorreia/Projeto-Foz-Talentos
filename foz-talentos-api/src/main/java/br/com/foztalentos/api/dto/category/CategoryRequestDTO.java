package br.com.foztalentos.api.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Dados de entrada para cadastro/atualização de categoria
public record CategoryRequestDTO(
        @NotBlank
        @Size(max = 80)
        String name

) {
}
