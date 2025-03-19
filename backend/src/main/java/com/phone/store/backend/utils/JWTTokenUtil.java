package com.phone.store.backend.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JWTTokenUtil {

    @Value("${phonestore.jwt.token-validity-in-seconds}")
    private long jwtExpirationHour;

    @Value("${phonestore.jwt.token-validity-in-day}")
    private long jwtExpirationDay;

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    public JWTTokenUtil(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String createAccessToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = now.plus(jwtExpirationHour, ChronoUnit.SECONDS);

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(authentication.getName())
                .claim("roles", roles)
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String createRefreshToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = now.plus(jwtExpirationDay, ChronoUnit.DAYS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(authentication.getName())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public boolean validateToken(String token) {
        try {
            Jwt decodedJwt = jwtDecoder.decode(token);
            Instant now = Instant.now();

            return decodedJwt.getExpiresAt() != null && decodedJwt.getExpiresAt().isAfter(now);
        } catch (JwtException e) {
            return false;
        }
    }
}
