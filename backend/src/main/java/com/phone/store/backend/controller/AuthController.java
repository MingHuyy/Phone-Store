package com.phone.store.backend.controller;


import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.dto.ResetPasswordDTO;
import com.phone.store.backend.model.dto.TokenDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.AuthService;
import com.phone.store.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private TokenService tokenService;
    @Autowired
    private AuthService authService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody TokenDTO tokenDTO) {
        return null;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(HttpServletRequest request,
                                           @RequestBody ResetPasswordDTO resetPasswordDTO) {
        // Lấy token từ request
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        String accessToken = authorizationHeader.substring(7);

        try {
            String userName = tokenService.getUsernameFromToken(accessToken);
            return authService.resetPassword(resetPasswordDTO, userName);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Token không hợp lệ hoặc đã hết hạn.", 401));
        }
    }

}
