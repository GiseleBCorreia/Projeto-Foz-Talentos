package br.com.foztalentos.api.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DatabaseKeepAliveScheduler {

    private final HealthService healthService;

    @Scheduled(cron = "0 0 */6 * * *")
    public void ping() {
        try {
            healthService.check();
            log.info("Database keep-alive ping succeeded");
        } catch (Exception e) {
            log.warn("Database keep-alive ping failed", e);
        }
    }
}
