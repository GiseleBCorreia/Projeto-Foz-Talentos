package br.com.foztalentos.api.controller;

import br.com.foztalentos.api.constant.ApiRoutes;
import br.com.foztalentos.api.dto.health.HealthResponseDTO;
import br.com.foztalentos.api.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiRoutes.HEALTH)
@RequiredArgsConstructor
@Tag(name = "Health")
public class HealthController {

    private final HealthService healthService;

    @Operation(summary = "Health check", description = "Verifica a API e pinga o banco para evitar pausa do Supabase.")
    @SecurityRequirements
    @GetMapping
    public ResponseEntity<HealthResponseDTO> health() {
        return ResponseEntity.ok(healthService.check());
    }
}
