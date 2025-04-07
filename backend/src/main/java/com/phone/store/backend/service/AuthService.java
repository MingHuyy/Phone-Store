package com.phone.store.backend.service;

import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.dto.ResetPasswordDTO;
import com.phone.store.backend.model.dto.UpdateUserDTO;
import com.phone.store.backend.model.dto.UserDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    ResponseEntity<TokenResponse> login(LoginDTO loginDTO);
    ResponseEntity<?> resetPassword(ResetPasswordDTO resetPasswordDTO, String userName);
    ResponseEntity<?> logout(String accessToken);
    ResponseEntity<?> update(UpdateUserDTO updateUserDTO);
    ResponseEntity<TokenResponse> refresh(String refreshToken);
    ResponseEntity<?> setPassword(String refreshToken);
}
