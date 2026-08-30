package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.job.JobFilterDTO;
import br.com.foztalentos.api.dto.job.JobRequestDTO;
import br.com.foztalentos.api.dto.job.JobResponseDTO;
import br.com.foztalentos.api.enums.ContractType;
import br.com.foztalentos.api.enums.JobLevel;
import br.com.foztalentos.api.enums.WorkMode;
import br.com.foztalentos.api.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.math.BigDecimal;
import java.time.LocalDate;

// Controller para listagem e gestão de vagas de emprego
@RestController
@RequestMapping(ApiRoutes.JOBS)
@RequiredArgsConstructor
public class JobController {

        private final JobService jobService;

        // Listagem paginada geral (pública)
        @Operation(summary = "Listar vagas", description = """
                Lista todas as vagas cadastradas.
                
                Suporta paginação e ordenação.
                
                Exemplo:
                GET /jobs?page=0&size=10&sort=createdAt,desc"""
        )
         @SecurityRequirements
         @GetMapping
         public ResponseEntity<Page<JobResponseDTO>> findAll(
                 @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

            Page<JobResponseDTO> jobs = jobService.findAll(pageable);
            return ResponseEntity.ok(jobs);
        }

        // Consulta de vaga por ID (pública)
        @Operation(summary = "Buscar vaga por ID")
        @SecurityRequirements
        @GetMapping("/{id}")
        public ResponseEntity<JobResponseDTO> findById( @PathVariable Long id) {
            return ResponseEntity.ok(jobService.findById(id));
        }

    // Busca customizada por múltiplos filtros de pesquisa (pública)
    @Operation(summary = "Filtrar vagas", description = """
        Filtros disponíveis:
        • search, states, categoryId, contractType, level, workMode, publishedAfter, publishedBefore

        Exemplo:
        /jobs/filter?states=RJ&categoryId=1&workMode=REMOTE&publishedAfter=2026-07-01&sort=createdAt,desc"""
    )
    @SecurityRequirements
    @GetMapping("/filter")
    public ResponseEntity<Page<JobResponseDTO>> filter(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String states,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ContractType contractType,
            @RequestParam(required = false) JobLevel level,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) LocalDate publishedAfter,
            @RequestParam(required = false) LocalDate publishedBefore,
            @RequestParam(required = false) BigDecimal minSalary,
             @RequestParam(required = false) BigDecimal maxSalary,
             @PageableDefault(size = 20, sort = "createdAt") Pageable pageable

    ) {
        // Instancia o DTO manualmente com os parâmetros recebidos
        JobFilterDTO filter = new JobFilterDTO();
        filter.setSearch(search);
        filter.setStates(states);
        filter.setCategoryId(categoryId);
        filter.setContractType(contractType);
        filter.setLevel(level);
        filter.setWorkMode(workMode);
        filter.setPublishedAfter(publishedAfter);
        filter.setPublishedBefore(publishedBefore);
        filter.setMinSalary(minSalary);
        filter.setMaxSalary(maxSalary);

        if (categoryId != null && categoryId <= 0) {
            throw new IllegalArgumentException("categoryId must be positive");
        }
        if (minSalary != null && minSalary.signum() < 0) {
            throw new IllegalArgumentException("minSalary cannot be negative");
        }
        if (maxSalary != null && maxSalary.signum() < 0) {
            throw new IllegalArgumentException("maxSalary cannot be negative");
        }        if (minSalary != null && maxSalary != null && minSalary.compareTo(maxSalary) > 0) {
            throw new IllegalArgumentException("minSalary cannot be greater than maxSalary");
        }
        if (publishedAfter != null && publishedBefore != null && publishedAfter.isAfter(publishedBefore)) {
            throw new IllegalArgumentException("publishedAfter cannot be after publishedBefore");
        }

        return ResponseEntity.ok(jobService.filter(filter, pageable));
    }

        // Cadastro de nova vaga (restrito a admins)
        @Operation(summary = "Cadastrar vaga")
        @PostMapping
        @PreAuthorize("hasAnyRole('MASTER','EMPLOYEE')")
        public ResponseEntity<JobResponseDTO> create(@Valid @RequestBody JobRequestDTO request) {

            JobResponseDTO savedJob = jobService.create(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
        }

        // Alteração dos dados da vaga (restrito a admins)
        @Operation(summary = "Atualizar vaga")
        @PutMapping("/{id}")
        @PreAuthorize("hasAnyRole('MASTER','EMPLOYEE')")
        public ResponseEntity<JobResponseDTO> update(@PathVariable Long id, @Valid @RequestBody JobRequestDTO request) {

            JobResponseDTO updatedJob = jobService.update(id, request);

            return ResponseEntity.ok(updatedJob);
        }

        // Inativação/encerramento da vaga (restrito a admins)
        @Operation(summary = "Desativar vaga")
        @PatchMapping("/{id}/deactivate")
        @PreAuthorize("hasAnyRole('MASTER','EMPLOYEE')")
        public ResponseEntity<Void> deactivate(@PathVariable Long id) {
            jobService.deactivate(id);
            return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Reativar vaga")
        @PatchMapping("/{id}/activate")
        @PreAuthorize("hasAnyRole('MASTER','EMPLOYEE')")
        public ResponseEntity<Void> activate(@PathVariable Long id){

            jobService.activate(id);

            return ResponseEntity.noContent().build();
        }
}
