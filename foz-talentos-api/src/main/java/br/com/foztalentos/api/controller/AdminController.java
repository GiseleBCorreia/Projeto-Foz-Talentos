package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.admin.AdminRequestDTO;
import br.com.foztalentos.api.dto.admin.AdminResponseDTO;
import br.com.foztalentos.api.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

// Controller para gerenciamento de administradores
@RestController
@RequestMapping(ApiRoutes.ADMINS)
@RequiredArgsConstructor
@PreAuthorize("hasRole('MASTER')")
@Tag(name = "Administradores")
public class AdminController {
    
        private final AdminService adminService;

        // Lista administradores de forma paginada
        @Operation(summary = "Listar administradores")
        @GetMapping
        public ResponseEntity<Page<AdminResponseDTO>> findAll(
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
            Page<AdminResponseDTO> admins = adminService.findAll(pageable);
            return ResponseEntity.ok(admins);
        }

        // Busca de administrador por ID
        @Operation(summary = "Buscar administrador por ID")
        @GetMapping("/{id}")
        public ResponseEntity<AdminResponseDTO> findById( @PathVariable Long id) {
            return ResponseEntity.ok(adminService.findById(id));
        }

        // Criação de novo administrador
        @Operation(summary = "Cadastrar administrador")
        @PostMapping
        public ResponseEntity<AdminResponseDTO> create(@Valid @RequestBody AdminRequestDTO request) {

            AdminResponseDTO savedAdmin = adminService.create(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedAdmin);
        }

        // Atualização total de cadastro
        @Operation(summary = "Atualizar administrador")
        @PutMapping("/{id}")
        public ResponseEntity<AdminResponseDTO> update(
                @PathVariable Long id,
                @Valid @RequestBody AdminRequestDTO request) {

            AdminResponseDTO updatedAdmin = adminService.update(id, request);

            return ResponseEntity.ok(updatedAdmin);
        }

        // Inativação de cadastro de administrador
        @Operation(summary = "Desativar administrador")
        @PatchMapping("/{id}/deactivate")
        public ResponseEntity<Void> deactivate(@PathVariable Long id) {
            adminService.deactivate(id);
            return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Reativar administrador")
        @PatchMapping("/{id}/activate")
        public ResponseEntity<Void> activate(@PathVariable Long id){
            adminService.activate(id);
            return ResponseEntity.noContent().build();
        }
}
