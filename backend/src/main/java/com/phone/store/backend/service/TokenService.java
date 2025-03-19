package com.phone.store.backend.service;

import com.phone.store.backend.entity.TokenEntity;

public interface TokenService {
    Long saveToken(TokenEntity tokenEntity);

    String deleteToken(Long tokenId);

    TokenEntity getByName(String name);

    public String getUsernameFromToken(String token);
}
