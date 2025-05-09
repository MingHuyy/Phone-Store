package com.phone.store.backend.controller;

import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.request.*;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.AuthService;
import com.phone.store.backend.service.CloudinaryService;
import com.phone.store.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private TokenService tokenService;
    @Autowired
    private AuthService authService;
    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody TokenRequest tokenRequest) {
        if (tokenRequest.getRefreshToken() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return authService.refresh(tokenRequest.getRefreshToken());
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo() {
        return authService.getUserInfo();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        return authService.resetPassword(resetPasswordRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        String username = authentication.getName();
        return authService.logout(username);
    }

    @PutMapping(value = "/update", consumes = { "multipart/form-data" })
    public ResponseEntity<?> update(@RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "img", required = false) MultipartFile img) {
        String phoneNumber = (phone == null || phone.isEmpty()) ? null : phone;

        String imageUrl = null;
        if (img != null && !img.isEmpty()) {
            try {
                imageUrl = cloudinaryService.uploadImage(img);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", true, "message", "Lỗi khi xử lý ảnh."));
            }
        }

        UpdateUserRequest updateUserRequest = UpdateUserRequest.builder()
                .username(username)
                .email(email)
                .phone(phoneNumber)
                .img(imageUrl)
                .build();
        return authService.update(updateUserRequest);
    }

    @PostMapping("/reset-password/v1")
    public ResponseEntity<StatusResponse> resetPassword(@RequestParam String refreshToken) {
        return new ResponseEntity<>(authService.setPassword(refreshToken).getStatusCode());
    }

}
