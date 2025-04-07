package com.phone.store.backend.controller;


import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.*;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
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
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginDTO loginDTO) {
        return authService.login(loginDTO);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody TokenDTO tokenDTO) {
        if (tokenDTO.getRefreshToken() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return authService.refresh(tokenDTO.getRefreshToken());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(HttpServletRequest request,
                                           @RequestBody ResetPasswordDTO resetPasswordDTO) {
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

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        String accessToken = authorizationHeader.substring(7);
        return authService.logout(accessToken);
    }
    @PutMapping(value = "/update", consumes = {"multipart/form-data"})
    public ResponseEntity<?> update(HttpServletRequest request,
                                    @RequestParam("username") String username,
                                    @RequestParam("email") String email,
                                    @RequestParam(value = "phone", required = false) String phone,
                                    @RequestParam(value = "img", required = false) MultipartFile img) {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", true, "message", "Không tìm thấy token hợp lệ."));
        }

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

        UpdateUserDTO updateUserDTO = UpdateUserDTO.builder()
                .username(username)
                .email(email)
                .phone(phoneNumber)
                .img(imageUrl)
                .build();
        return authService.update(updateUserDTO);
    }

    @PostMapping("/reset-password/v1")
    public ResponseEntity<StatusResponse> resetPassword(@RequestParam String refreshToken) {
        return new ResponseEntity<>(authService.setPassword(refreshToken).getStatusCode());
    }

}
