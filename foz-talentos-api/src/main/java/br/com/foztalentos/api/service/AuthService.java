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
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO request){

        Admin admin = adminRepository.findByEmail(request.email()).orElseThrow(()
                -> new BusinessException("Invalid email or password."));

        if (!admin.getActive()) {
            throw new BusinessException("Account is deactivated.");
        }

        if(!passwordEncoder.matches(
                request.password(),
                admin.getPassword()
        )){
            throw new BusinessException("Invalid email or password.");
        }

        String token = jwtService.generateToken(admin);

        return new LoginResponseDTO(
                token,
                "Login successful",
                admin.getName(),
                admin.getRole().name(),
                admin.getEmail()
        );

    }

}
