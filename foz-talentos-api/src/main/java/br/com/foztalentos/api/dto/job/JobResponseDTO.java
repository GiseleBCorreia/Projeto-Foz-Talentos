package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Dados de saída com detalhes completos de uma vaga
public record JobResponseDTO(

        Long id,
        String title,
        String company,
        String state,
        ContractType contractType,
        JobLevel level,
        WorkMode workMode,
        String salary,
        BigDecimal salaryValue,
        Boolean active,
        String description,
        String requirements,
        String benefits,
        String phone,
        String email,
        String category,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
