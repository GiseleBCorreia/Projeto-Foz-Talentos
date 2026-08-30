package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

// Dados de entrada para criação/edição de uma vaga
public record JobRequestDTO(

        @NotBlank
        @Size(max = 160)
        String title,

        @NotBlank
        @Size(max = 160)
        String company,

        @NotBlank
        @Size(max = 80)
        String state,

        @NotNull
        ContractType contractType,

        @NotNull
        JobLevel level,

        @NotNull
        WorkMode workMode,

        @NotBlank
        @Size(max = 120)
        String salary,

        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal salaryValue,

        @NotBlank
        @Size(max = 10000)
        String description,

        @NotBlank
        @Size(max = 10000)
        String requirements,

        @NotBlank
        @Size(max = 10000)
        String benefits,

        @NotBlank
        @Size(max = 30)
        String phone,

        @Email
        @NotBlank
        @Size(max = 254)
        String email,

        @NotNull
        @Positive
        Long categoryId

) {}
