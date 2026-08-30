package br.com.foztalentos.api.dto.admin;

import br.com.foztalentos.api.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Dados de entrada para cadastro/atualização de administradores
public record AdminRequestDTO(

        @NotBlank
        @Size(max = 120)
        String name,

        @Email
        @NotBlank
        @Size(max = 254)
        String email,

        @Size(min = 12, max = 72)
        String password,

        @NotNull
        Role role

) {
}