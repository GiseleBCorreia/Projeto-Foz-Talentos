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
    private final LoginAttemptService loginAttemptService;

    public LoginResponseDTO login(LoginRequestDTO request){
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        loginAttemptService.checkAllowed(email);

        Admin admin = adminRepository.findByEmailIgnoreCase(email).orElseThrow(()
                -> {
            loginAttemptService.loginFailed(email);
            return new BusinessException("Invalid email or password.");
        });

        if (!admin.getActive()) {
            loginAttemptService.loginFailed(email);
            throw new BusinessException("Invalid email or password.");
        }

        if(!passwordEncoder.matches(
                request.password(),
                admin.getPassword()
        )){
            loginAttemptService.loginFailed(email);
            throw new BusinessException("Invalid email or password.");
        }

        loginAttemptService.loginSucceeded(email);
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
