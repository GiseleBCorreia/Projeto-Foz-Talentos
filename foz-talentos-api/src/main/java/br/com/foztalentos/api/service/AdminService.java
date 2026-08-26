package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.admin.AdminRequestDTO;
import br.com.foztalentos.api.dto.admin.AdminResponseDTO;
import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.enums.Role;
import br.com.foztalentos.api.exception.BusinessException;
import br.com.foztalentos.api.exception.ResourceNotFoundException;
import br.com.foztalentos.api.repository.AdminRepository;
import br.com.foztalentos.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

// Serviço de regras de negócio para gerenciamento de administradores
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    // Cadastra um novo administrador no sistema
    public AdminResponseDTO create(AdminRequestDTO request) {

        Admin admin = new Admin();

        admin.setName(request.name());
        admin.setEmail(request.email());
        admin.setRole(request.role());
        admin.setActive(true);

        if (request.password() == null || request.password().isBlank()) {
            throw new BusinessException("Password is required for user creation.");
        }
        admin.setPassword(passwordEncoder.encode(request.password()));

        // Impede cadastro duplicado de e-mail
        if(adminRepository.existsByEmail(admin.getEmail())) {
            throw new BusinessException("Email Already registered");
        }

        Admin savedAdmin = adminRepository.save(admin);

        return toResponseDTO(savedAdmin);
    }

    // Retorna todos os administradores com paginação
    public Page<AdminResponseDTO> findAll(Pageable pageable) {

        return adminRepository.findAll(pageable).map(this::toResponseDTO);

    }

    // Busca um administrador pelo ID ou lança 404
    public AdminResponseDTO findById(Long id) {

        Admin admin = adminRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Admin not found."));

        return toResponseDTO(admin);

    }

    // Atualiza os dados do administrador
    public AdminResponseDTO update(Long id, AdminRequestDTO request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        Admin loggedAdmin = user.getAdmin();

        Admin admin = adminRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Admin not found."));

        // Impede que um MASTER remova sua própria permissão de MASTER
        if (loggedAdmin.getId().equals(admin.getId()) && request.role() != Role.MASTER) {
            throw new BusinessException("You cannot remove your own MASTER permission.");
        }

        // Apenas MASTER pode alterar cargos
        if (request.role() != admin.getRole()) {

            if (loggedAdmin.getRole() != Role.MASTER) {
                throw new BusinessException("Only MASTER can change administrator roles.");
            }

            admin.setRole(request.role());
        }

        // Valida se o novo e-mail já pertence a outro registro
        Admin existing = adminRepository.findByEmail(request.email()).orElse(null);

        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException("Email already registered.");
        }

        admin.setName(request.name());
        admin.setEmail(request.email());

        // Atualiza a senha somente se um novo valor for enviado
        if (request.password() != null && !request.password().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.password()));
        }

        admin.setUpdatedAt(LocalDateTime.now());

        Admin updatedAdmin = adminRepository.save(admin);

        return toResponseDTO(updatedAdmin);
    }

    // Realiza a desativação lógica (soft delete) do administrador
    public void deactivate(Long id) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

        if (user.getAdmin().getId().equals(id)) {
            throw new BusinessException("You cannot deactivate your own account.");
        }

        Admin admin = adminRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Admin not found."));

        admin.setActive(false);
        admin.setUpdatedAt(LocalDateTime.now());

        adminRepository.save(admin);

    }

    public void activate(Long id){

        Admin admin = adminRepository.findById(id).orElseThrow(()
                -> new ResourceNotFoundException("Admin not found."));

        admin.setActive(true);
        admin.setUpdatedAt(LocalDateTime.now());

        adminRepository.save(admin);
    }

    // Converte a entidade Admin em DTO de resposta
    private AdminResponseDTO toResponseDTO(Admin admin) {

        return new AdminResponseDTO(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getRole(),
                admin.getActive(),
                admin.getCreatedAt(),
                admin.getUpdatedAt()
        );

    }

}