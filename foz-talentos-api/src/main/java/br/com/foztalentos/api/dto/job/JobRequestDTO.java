package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

// Dados de entrada para criação/edição de uma vaga
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
        JobLevel level,

        @NotNull
        WorkMode workMode,

        @NotBlank
        String salary,

        BigDecimal salaryValue,

        @NotBlank
        String description,

        @NotBlank
        String requirements,

        @NotBlank
        String benefits,

        @NotBlank
        String phone,

        @Email
        @NotBlank
        String email,

        @NotNull
        Long categoryId

) {}
