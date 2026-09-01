package br.com.foztalentos.api.service;

import br.com.foztalentos.api.dto.health.HealthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HealthService {

    private final JdbcTemplate jdbcTemplate;

    public HealthResponseDTO check() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return new HealthResponseDTO("UP", LocalDateTime.now());
    }
}
