package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.WorkMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JobRequestDTO(

        @NotBlank
        String title,

        @NotBlank
        String company,

        @NotBlank
        String state,

        @NotNull
        ContractType contractType,

        @NotNull
        WorkMode workMode,

        @NotBlank
        String salary,

        @NotBlank
        String description,

        @NotBlank
        String requirements,

        @NotBlank
        String benefits,

        @NotBlank
        String phone,

        @Email
        String email,

        @NotNull
        Long categoryId

) {}
