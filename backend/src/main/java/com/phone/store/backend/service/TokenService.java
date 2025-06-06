package com.phone.store.backend.service;

import com.phone.store.backend.entity.TokenEntity;
import com.phone.store.backend.respository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class TokenService {

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private JwtDecoder jwtDecoder;

    public Long saveToken(TokenEntity tokenEntity) {
        Optional<TokenEntity> token = tokenRepository.findByUserName(tokenEntity.getUserName());
        if (token.isEmpty()) {
            tokenRepository.save(tokenEntity);
            return tokenEntity.getId();
        } else {
            TokenEntity currentToken = token.get();
            currentToken.setAccessToken(tokenEntity.getAccessToken());
            currentToken.setRefreshToken(tokenEntity.getRefreshToken());
            tokenRepository.save(currentToken);
            return tokenEntity.getId();
        }
    }

    public String deleteToken(Long tokenId) {
        return "";
    }

    public TokenEntity getByName(String name) {
        return null;
    }

    public String getUsernameFromToken(String token) {
        try {
            return jwtDecoder.decode(token).getSubject();
        } catch (JwtException e) {
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getClaim("userId");
        } catch (JwtException e) {
            throw new RuntimeException("Token không hợp lệ", e);
        }
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
