package com.phone.store.backend.service;

import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.dto.ResetPasswordDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<TokenResponse> login(LoginDTO loginDTO);
    ResponseEntity<?> resetPassword(ResetPasswordDTO resetPasswordDTO, String userName);

}
