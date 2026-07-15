package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.job.JobRequestDTO;
import br.com.foztalentos.api.dto.job.JobResponseDTO;
import br.com.foztalentos.api.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public JobResponseDTO create(JobRequestDTO request) {
        return null;
    }

    public List<JobResponseDTO> findAll() {
        return null;
    }

    public JobResponseDTO findById(Long id) {
        return null;
    }

    public JobResponseDTO update(Long id, JobRequestDTO request) {
        return null;
    }

    public void deactivate(Long id) {

    }

    public List<JobResponseDTO> search(String search) {
        return null;
    }

    public List<JobResponseDTO> filter() {
        return null;
    }

}
