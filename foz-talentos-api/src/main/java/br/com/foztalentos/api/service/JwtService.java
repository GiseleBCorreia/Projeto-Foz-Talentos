package br.com.foztalentos.api.service;

import br.com.foztalentos.api.entity.Admin;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Objects;

// Serviço responsável por criar, decodificar e validar tokens JWT
@Service
public class JwtService {

    // Chave secreta obtida do application.properties
    @Value("${jwt.secret}")
    private String secret;

    // Tempo de validade do token obtido do application.properties
    @Value("${jwt.expiration}")
    private Long expiration;

    // Converte a chave secreta textual em uma chave HMAC válida para o JJWT
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Gera um novo token JWT com subject (e-mail) e claim de papel (role)
    public String generateToken(Admin admin) {

        Date now = new Date();
        LocalDateTime credentialsUpdatedAt = admin.getUpdatedAt() != null ? admin.getUpdatedAt() : LocalDateTime.now();
        long credentialsVersion = credentialsUpdatedAt
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        return Jwts.builder().subject(admin.getEmail()).claim("role", admin.getRole().name())
                .claim("cv", credentialsVersion)
                .issuedAt(now).expiration(new Date(now.getTime() + expiration))
                .signWith(getKey()).compact();

    }

    // Extrai o e-mail do usuário contido no payload do token
    public String extractEmail(String token) {

        Claims claims = Jwts.parser().verifyWith(getKey())
                .build().parseSignedClaims(token).getPayload();

        return claims.getSubject();

    }

    // Verifica se o token pertence ao admin informado e se não está expirado
    public boolean isTokenValid(String token, Admin admin) {

        Claims claims = Jwts.parser().verifyWith(getKey())
                .build().parseSignedClaims(token).getPayload();

        LocalDateTime credentialsUpdatedAt = admin.getUpdatedAt() != null ? admin.getUpdatedAt() : LocalDateTime.MIN;
        long expectedVersion = credentialsUpdatedAt
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();
        Number tokenVersion = claims.get("cv", Number.class);
        boolean versionMatches = tokenVersion == null || tokenVersion.longValue() == expectedVersion;
        return Objects.equals(claims.getSubject(), admin.getEmail())
                && claims.getExpiration() != null
                && claims.getExpiration().after(new Date())
                && versionMatches;

    }

}