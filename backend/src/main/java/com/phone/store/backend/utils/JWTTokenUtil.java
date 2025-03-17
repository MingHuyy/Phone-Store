package com.phone.store.backend.utils;

import com.nimbusds.jose.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class JWTTokenUtil {

    @Value("${phonestore.jwt.base-secret}")
    private String baseSecret;

    @Value("${phonestore.jwt.token-validity-in-seconds}")
    private long jwtExpirationHour;

    @Value("${phonestore.jwt.token-validity-in-day}")
    private long jwtExpirationDay;

    private final JwtEncoder jwtEncoder;

    public JWTTokenUtil(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    public String createAccessToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = now.plus(jwtExpirationHour, ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(authentication.getName())
                .claim("jwt", authentication)
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader,
                claims)).getTokenValue();
    }

    public String createRefreshToken(Authentication authentication) {
        Instant now = Instant.now();
        Instant validity = now.plus(jwtExpirationDay, ChronoUnit.DAYS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(validity)
                .subject(authentication.getName())
                .claim("jwt", authentication)
                .build();

        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

}
