package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.job.JobFilterDTO;
import br.com.foztalentos.api.dto.job.JobRequestDTO;
import br.com.foztalentos.api.dto.job.JobResponseDTO;
import br.com.foztalentos.api.entity.Category;
import br.com.foztalentos.api.entity.Job;
import br.com.foztalentos.api.exception.BusinessException;
import br.com.foztalentos.api.exception.ResourceNotFoundException;
import br.com.foztalentos.api.repository.CategoryRepository;
import br.com.foztalentos.api.repository.JobRepository;
import br.com.foztalentos.api.specification.JobSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final CategoryRepository categoryRepository;

    public JobResponseDTO create(JobRequestDTO request) {

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));

        Job job = new Job();

        job.setTitle(request.title());
        job.setCompany(request.company());
        job.setState(request.state());
        job.setContractType(request.contractType());
        job.setWorkMode(request.workMode());
        job.setSalary(request.salary());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setBenefits(request.benefits());
        job.setPhone(request.phone());
        job.setEmail(request.email());
        job.setCategory(category);
        job.setActive(true);
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());

        if(request.salary().isBlank()){
            throw new BusinessException("Salary is required.");
        }

        Job savedJob = jobRepository.save(job);

        return toResponseDTO(savedJob);

    }

    public List<JobResponseDTO> findAll() {

        return jobRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    public List<JobResponseDTO> filter(JobFilterDTO filter) {

        return jobRepository.findAll(JobSpecification.filter(filter))
                .stream().map(this::toResponseDTO).toList();
    }

    public JobResponseDTO findById(Long id) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        return toResponseDTO(job);

    }

    public JobResponseDTO update(Long id, JobRequestDTO request) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        Category category = categoryRepository.findById(request.categoryId()).orElseThrow(()
                -> new ResourceNotFoundException("Category not found."));

        job.setTitle(request.title());
        job.setCompany(request.company());
        job.setState(request.state());
        job.setContractType(request.contractType());
        job.setWorkMode(request.workMode());
        job.setSalary(request.salary());
        job.setDescription(request.description());
        job.setRequirements(request.requirements());
        job.setBenefits(request.benefits());
        job.setPhone(request.phone());
        job.setEmail(request.email());
        job.setCategory(category);

        job.setUpdatedAt(LocalDateTime.now());

        Job updatedJob = jobRepository.save(job);

        return toResponseDTO(updatedJob);

    }

    public void deactivate(Long id) {

        Job job = jobRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Job not found."));

        job.setActive(false);
        job.setUpdatedAt(LocalDateTime.now());

        jobRepository.save(job);

    }

    private JobResponseDTO toResponseDTO(Job job) {

        return new JobResponseDTO(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getState(),
                job.getContractType(),
                job.getWorkMode(),
                job.getSalary(),
                job.getActive(),
                job.getDescription(),
                job.getRequirements(),
                job.getBenefits(),
                job.getPhone(),
                job.getEmail(),
                job.getCategory().getName(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );

    }

}