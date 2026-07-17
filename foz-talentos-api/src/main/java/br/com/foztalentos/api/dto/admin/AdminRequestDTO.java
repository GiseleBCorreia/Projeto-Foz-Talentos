package br.com.foztalentos.api.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminRequestDTO(

        @NotBlank
        String name,

        @Email
        @NotBlank
        String email,

        @NotBlank
        String password

) {
}