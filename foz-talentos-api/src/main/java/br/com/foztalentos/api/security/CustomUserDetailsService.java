package br.com.foztalentos.api.security;

import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

// Serviço que busca o usuário no banco de dados para o processo de autenticação
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    // Carrega os dados do administrador pelo e-mail
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Admin admin = adminRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Admin not found."));

        if (!admin.getActive()) {
            throw new UsernameNotFoundException("Admin is deactivated.");
        }

        return new CustomUserDetails(admin);

    }

}