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

        // Permite requisições de qualquer origem (domínio)
        configuration.setAllowedOrigins(List.of("*"));

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

        // Aplica as regras acima para todas as rotas da API
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return new CorsFilter(source);

    }

}