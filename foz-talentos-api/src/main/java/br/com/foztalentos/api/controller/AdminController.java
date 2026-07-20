package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.admin.AdminRequestDTO;
import br.com.foztalentos.api.dto.admin.AdminResponseDTO;
import br.com.foztalentos.api.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiRoutes.ADMINS)
@RequiredArgsConstructor
public class AdminController {
    
        private final AdminService adminService;

        @GetMapping
        public ResponseEntity<List<AdminResponseDTO>> findAll() {
            List<AdminResponseDTO> admins = adminService.findAll();
            return ResponseEntity.ok(admins);
        }

        @GetMapping("/{id}")
        public ResponseEntity<AdminResponseDTO> findById( @PathVariable Long id) {
            return ResponseEntity.ok(adminService.findById(id));
        }

        @PostMapping
        public ResponseEntity<AdminResponseDTO> create(@Valid @RequestBody AdminRequestDTO request) {

            AdminResponseDTO savedAdmin = adminService.create(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedAdmin);
        }

        @PutMapping("/{id}")
        public ResponseEntity<AdminResponseDTO> update(
                @PathVariable Long id,
                @Valid @RequestBody AdminRequestDTO request) {

            AdminResponseDTO updatedAdmin = adminService.update(id, request);

            return ResponseEntity.ok(updatedAdmin);
        }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        adminService.deactivate(id);
        return ResponseEntity.noContent().build();
    }


    }
