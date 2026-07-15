package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.admin.AdminRequestDTO;
import br.com.foztalentos.api.dto.admin.AdminResponseDTO;
import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

        private final AdminRepository adminRepository;

        public AdminResponseDTO create(AdminRequestDTO request) {
            return null;
        }

        public List<AdminResponseDTO> findAll() {
            return null;
        }

        public AdminResponseDTO findById(Long id) {
            return null;
        }

        public AdminResponseDTO update(Long id, AdminRequestDTO request) {
            return null;
        }

        public void deactivate(Long id) {

        }

        public Admin findByEmail(String email) {
            return null;
        }

    }