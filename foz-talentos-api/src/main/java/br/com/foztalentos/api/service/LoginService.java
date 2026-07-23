package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.login.LoginRequestDTO;
import br.com.foztalentos.api.dto.login.LoginResponseDTO;
import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.exception.BusinessException;
import br.com.foztalentos.api.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO login(LoginRequestDTO request) {

        Admin admin = adminRepository.findByEmail(request.email()).orElseThrow(()
                -> new BusinessException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new BusinessException("Invalid email or password");
        }

        return new LoginResponseDTO(admin.getPassword());
    }
}
