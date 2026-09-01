package br.com.foztalentos.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    // Define o filtro com as regras de requisições cross-origin
    @Bean
    public CorsFilter corsFilter() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "https://foztalentos.com.br",
                "https://fozzzz.netlify.app",
                "http://localhost:3000",
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        ));

        // Verbos HTTP liberados
        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Permite o envio de qualquer cabeçalho na requisição
        configuration.setAllowedHeaders(List.of("*"));

        // Autoriza o envio de cookies e tokens de autenticação
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        // Aplica as regras acima para todas as rotas da API
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return new CorsFilter(source);

    }

}