package com.phone.store.backend.service;

import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.response.TokenResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<TokenResponse> login(LoginDTO loginDTO);
}
