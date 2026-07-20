package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.WorkMode;

import java.util.List;

public record JobFilterDTO(

        String search,
        List<String> states,
        Long categoryId,
        ContractType contractType,
        WorkMode workMode

) {}
