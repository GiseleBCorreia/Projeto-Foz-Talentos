package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.job.JobFilterDTO;
import br.com.foztalentos.api.dto.job.JobRequestDTO;
import br.com.foztalentos.api.dto.job.JobResponseDTO;
import br.com.foztalentos.api.entity.Category;
import br.com.foztalentos.api.entity.Job;
import br.com.foztalentos.api.exception.ResourceNotFoundException;
import br.com.foztalentos.api.repository.CategoryRepository;
import br.com.foztalentos.api.repository.JobRepository;
import br.com.foztalentos.api.specification.JobSpecification;
import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

// Serviço para gerenciamento e busca avançada de vagas de trabalho
@Service
@RequiredArgsConstructor
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final CategoryRepository categoryRepository;

    // Cadastra uma nova vaga vinculada a uma categoria existente
    public JobResponseDTO create(JobRequestDTO request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        Admin loggedAdmin = user.getAdmin();

        Category category = categoryRepository.findById(request.categoryId()).orElseThrow(()
                -> new ResourceNotFoundException("Category not found."));
        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new ResourceNotFoundException("Category not found.");
        }

        Job job = new Job();
        job.setCreatedBy(loggedAdmin);

        job.setTitle(request.title());
        job.setCompany(request.company());
        job.setState(request.state());
        job.setContractType(request.contractType());
        job.setLevel(request.level());
        job.setWorkMode(request.workMode());
        job.setSalary(request.salary());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setBenefits(request.benefits());
        job.setPhone(request.phone());
        job.setEmail(request.email());
        job.setCategory(category);
        job.setActive(true);
        job.setSalaryValue(request.salaryValue());

        Job savedJob = jobRepository.save(job);

        return toResponseDTO(savedJob);

    }

    // Retorna todas as vagas paginadas
    public Page<JobResponseDTO> findAll(Pageable pageable) {
        return jobRepository.findAll((root, query, cb)
                -> cb.isTrue(root.get("active")), pageable).map(this::toResponseDTO);

    }

    // Executa busca paginada filtrada com Criteria API via Specification
    public Page<JobResponseDTO> filter(JobFilterDTO filter, Pageable pageable) {

        return jobRepository.findAll(JobSpecification.filter(filter), pageable).map(this::toResponseDTO);
    }

    // Busca dados de uma vaga específica por ID
    public JobResponseDTO findById(Long id) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));
        if (!Boolean.TRUE.equals(job.getActive())) {
            throw new ResourceNotFoundException("Job not found.");
        }

        return toResponseDTO(job);

    }

    // Atualiza as informações da vaga e revalida a categoria
    public JobResponseDTO update(Long id, JobRequestDTO request) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        Category category = categoryRepository.findById(request.categoryId()).orElseThrow(()
                -> new ResourceNotFoundException("Category not found."));
        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new ResourceNotFoundException("Category not found.");
        }

        job.setTitle(request.title());
        job.setCompany(request.company());
        job.setState(request.state());
        job.setContractType(request.contractType());
        job.setLevel(request.level());
        job.setWorkMode(request.workMode());
        job.setSalary(request.salary());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setBenefits(request.benefits());
        job.setPhone(request.phone());
        job.setEmail(request.email());
        job.setCategory(category);
        job.setSalaryValue(request.salaryValue());

        Job updatedJob = jobRepository.save(job);

        return toResponseDTO(updatedJob);

    }

    // Inativa a vaga (soft delete)
    public void deactivate(Long id) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        job.setActive(false);
        job.setUpdatedAt(LocalDateTime.now());

        jobRepository.save(job);

    }

    public void activate(Long id){

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        job.setActive(true);
        job.setUpdatedAt(LocalDateTime.now());

        jobRepository.save(job);
    }

    // Mapeia a entidade Job para o DTO de resposta da API
    private JobResponseDTO toResponseDTO(Job job) {

        return new JobResponseDTO(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getState(),
                job.getContractType(),
                job.getLevel(),
                job.getWorkMode(),
                job.getSalary(),
                job.getSalaryValue(),
                job.getActive(),
                job.getDescription(),
                job.getRequirements(),
                job.getBenefits(),
                job.getPhone(),
                job.getEmail(),
                job.getCategory().getName(),
                job.getCreatedBy() != null ? job.getCreatedBy().getName() : null,
                job.getCreatedAt(),
                job.getUpdatedAt()
        );

    }

}