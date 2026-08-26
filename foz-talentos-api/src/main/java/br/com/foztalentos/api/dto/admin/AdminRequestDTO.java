package br.com.foztalentos.api.dto.admin;

import br.com.foztalentos.api.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Dados de entrada para cadastro/atualização de administradores
public record AdminRequestDTO(

        @NotBlank
        String name,

        @Email
        @NotBlank
        String email,

        String password,

        @NotNull
        Role role

) {
}