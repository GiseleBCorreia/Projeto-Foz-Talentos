package br.com.foztalentos.api.service;

import br.com.foztalentos.api.exception.TooManyRequestsException;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_SECONDS = 15 * 60;

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 86400000) // Esvazia o mapa a cada 24h para evitar memory leak
    public void clearAllAttempts() {
        attempts.clear();
    }

    public void checkAllowed(String email) {
        Attempt attempt = attempts.get(normalize(email));
        if (attempt == null) {
            return;
        }
        if (attempt.lockedUntil != null && Instant.now().isBefore(attempt.lockedUntil)) {
            throw new TooManyRequestsException("Too many login attempts. Try again later.");
        }
        if (attempt.lockedUntil != null && Instant.now().isAfter(attempt.lockedUntil)) {
            attempts.remove(normalize(email));
        }
    }

    public void loginSucceeded(String email) {
        attempts.remove(normalize(email));
    }

    public void loginFailed(String email) {
        String key = normalize(email);
        Attempt attempt = attempts.computeIfAbsent(key, ignored -> new Attempt());
        attempt.count += 1;
        if (attempt.count >= MAX_ATTEMPTS) {
            attempt.lockedUntil = Instant.now().plusSeconds(LOCK_DURATION_SECONDS);
        }
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private static class Attempt {
        private int count;
        private Instant lockedUntil;
    }
}
