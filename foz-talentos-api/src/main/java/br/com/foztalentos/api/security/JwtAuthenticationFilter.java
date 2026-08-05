package br.com.foztalentos.api.security;

import br.com.foztalentos.api.entity.Admin;
import br.com.foztalentos.api.repository.AdminRepository;
import br.com.foztalentos.api.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Filtro executado a cada requisição HTTP para interceptar e validar o Token JWT
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Extrai o cabeçalho Authorization da requisição
        String authHeader = request.getHeader("Authorization");

        // Valida se o cabeçalho existe e utiliza o esquema Bearer
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Remove o trecho "Bearer " para isolar a string do token
            String token = authHeader.substring(7);

            // Extrai o e-mail codificado no payload do token
            String email = jwtService.extractEmail(token);

            // Valida o token e autentica no contexto se não houver autenticação ativa
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {


                Admin admin = adminRepository.findByEmail(email).orElse(null);

            // Se o admin não existir ou estiver desativado, interrompe a autenticação
                if (admin == null || !admin.getActive()) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                if (jwtService.isTokenValid(token, admin)) {

                    CustomUserDetails userDetails = new CustomUserDetails(admin);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    System.out.println("USUARIO AUTENTICADO: "
                            + authentication.getName());

                    System.out.println("AUTORIDADES: "
                            + authentication.getAuthorities());
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);

    }

}