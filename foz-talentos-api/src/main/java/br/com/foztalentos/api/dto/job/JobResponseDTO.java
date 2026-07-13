package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.WorkMode;

import java.time.LocalDateTime;

public record JobResponseDTO(

        Long id,
        String title,
        String company,
        String state,
        ContractType contractType,
        WorkMode workMode,
        String salary,
        Boolean active,
        String description,
        String requirements,
        String benefits,
        String phone,
        String email,
        String category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}
