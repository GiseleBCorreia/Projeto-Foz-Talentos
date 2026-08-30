package br.com.foztalentos.api.dto.job;

import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobFilterDTO {
    private String search;
    private String states;
    private Long categoryId;    private ContractType contractType;
    private JobLevel level;
    private WorkMode workMode;
    private LocalDate publishedAfter;
    private LocalDate publishedBefore;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;

}