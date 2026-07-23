package br.com.foztalentos.api.dto.login;

public record LoginResponseDTO(

        String token,
        String name,
        String type,
        String email
) {}
