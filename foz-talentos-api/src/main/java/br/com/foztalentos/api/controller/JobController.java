package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.job.JobRequestDTO;
import br.com.foztalentos.api.dto.job.JobResponseDTO;
import br.com.foztalentos.api.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiRoutes.JOBS)
@RequiredArgsConstructor
public class JobController {

        private final JobService jobService;

        @GetMapping
        public ResponseEntity<List<JobResponseDTO>> findAll() {
            List<JobResponseDTO> jobs = jobService.findAll();
            return ResponseEntity.ok(jobs);
        }

        @GetMapping("/{id}")
        public ResponseEntity<JobResponseDTO> findById( @PathVariable Long id) {
            return ResponseEntity.ok(jobService.findById(id));
        }

        @PostMapping
        public ResponseEntity<JobResponseDTO> create(@Valid @RequestBody JobRequestDTO request) {

            JobResponseDTO savedJob = jobService.create(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
        }

        @PutMapping("/{id}")
        public ResponseEntity<JobResponseDTO> update(
                @PathVariable Long id,
                @Valid @RequestBody JobRequestDTO request) {

            JobResponseDTO updatedJob = jobService.update(id, request);

            return ResponseEntity.ok(updatedJob);
        }

        @PatchMapping("/{id}/deactivate")
        public ResponseEntity<Void> deactivate(@PathVariable Long id) {
            jobService.deactivate(id);
            return ResponseEntity.noContent().build();
        }
}
