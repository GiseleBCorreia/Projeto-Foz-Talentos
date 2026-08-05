package br.com.foztalentos.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    // Registra as metainformações exibidas no Swagger UI
    @Bean
    public OpenAPI customOpenAPI() {

        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()

                // Servidor de produção (Railway)
                .servers(List.of(new Server()
                                .url("https://foz-talentos-api-production.up.railway.app")
                                .description("Production Server")))

                .info(new Info()
                                .title("Foz Talentos API")
                                .version("1.0")
                                .description("""
                                        API responsável pelo gerenciamento de:
                                        - Administradores
                                        - Categorias
                                        - Vagas
                                        - Autenticação JWT
                                        """)
                                .contact(new Contact()
                                        .name("Equipe Foz Talentos")
                                        .email("contato@foztalentos.com"))
                                .license(new License().name("MIT")))

                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))

                .components(new Components().addSecuritySchemes(securitySchemeName,
                            new SecurityScheme()
                                    .name(securitySchemeName)
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")
                                )
                );
    }
}