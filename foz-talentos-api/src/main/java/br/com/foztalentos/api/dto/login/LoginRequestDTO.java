package br.com.foztalentos.api.dto.login;

public record LoginRequestDTO(
    String email,
    String password
) {}
