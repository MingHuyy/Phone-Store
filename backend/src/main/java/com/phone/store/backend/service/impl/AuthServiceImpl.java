package com.phone.store.backend.service.impl;

import com.phone.store.backend.Converter.UserConverter;
import com.phone.store.backend.entity.RoleEntity;
import com.phone.store.backend.entity.TokenEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.dto.ResetPasswordDTO;
import com.phone.store.backend.model.dto.UpdateUserDTO;
import com.phone.store.backend.model.dto.UserDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.TokenResponse;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.TokenRepository;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.AuthService;
import com.phone.store.backend.service.TokenService;
import com.phone.store.backend.utils.JWTTokenUtil;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    AuthenticationManagerBuilder authenticationManagerBuilder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTTokenUtil jwtTokenUtil;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private UserConverter userConverter;

    @Override
    public ResponseEntity<TokenResponse> login(LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(), loginDTO.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        UserEntity user = userRepository.findByUsername(loginDTO.getUsername());

        Set<RoleEntity> roleEntities = user.getRoles();
        String roles = roleEntities.stream()
                .map(RoleEntity::getName)
                .collect(Collectors.joining(","));

        String accessToken = jwtTokenUtil.createAccessToken(authentication);
        String refreshToken = jwtTokenUtil.createRefreshToken(authentication);
        tokenService.saveToken(TokenEntity.builder()
                .userName(user.getUsername())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());
        TokenResponse jwtToken = new TokenResponse();
        jwtToken.setAccessToken(accessToken);
        jwtToken.setUserId(user.getId());
        jwtToken.setRefreshToken(refreshToken);
        jwtToken.setRole(roles);
        return ResponseEntity.ok(jwtToken);
    }

    @Override
    public ResponseEntity<?> resetPassword(ResetPasswordDTO resetPasswordDTO, String userName) {
        UserEntity user = userRepository.findByUsername(userName);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy người dùng."));
        }
        if (!passwordEncoder.matches(resetPasswordDTO.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Mật khẩu cũ không đúng"));
        }
        user.setPassword(passwordEncoder.encode(resetPasswordDTO.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok
                (Map.of("message", "Đổi mật khẩu thành công"));
    }

    @Override
    public ResponseEntity<?> logout(String accessToken) {
        String userName = tokenService.getUsernameFromToken(accessToken);
        System.out.println("Username từ token: " + userName);
        tokenRepository.deleteByUserName(userName);
        return ResponseEntity.ok(Map.of(
                "message", "Logout thành công!"
        ));
    }

    @Override
    public ResponseEntity<?> update(UpdateUserDTO updateUserDTO) {
        UserEntity user = userRepository.findByUsername(updateUserDTO.getUsername());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Người dùng không tồn tại"));
        }

        if (!user.getEmail().equals(updateUserDTO.getEmail())) {
            UserEntity existingUserWithEmail = userRepository.findByEmail(updateUserDTO.getEmail());
            if (existingUserWithEmail != null && !existingUserWithEmail.getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email đã được sử dụng bởi tài khoản khác"));
            }
        }

        if (updateUserDTO.getPhone() != null && !updateUserDTO.getPhone().isEmpty()) {
            if (user.getPhone() == null || !user.getPhone().equals(updateUserDTO.getPhone())) {
                UserEntity existingUserWithPhone = userRepository.findByPhone(updateUserDTO.getPhone());
                if (existingUserWithPhone != null && !existingUserWithPhone.getId().equals(user.getId())) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "Số điện thoại đã được sử dụng bởi tài khoản khác"));
                }
            }
        }

        user.setPhone(updateUserDTO.getPhone());
        user.setEmail(updateUserDTO.getEmail());
        user.setImg(updateUserDTO.getImg());

        try {
            userRepository.save(user);
            UserResponse response = userConverter.convertToResponse(user);
            return ResponseEntity.ok(response);
        } catch (DataIntegrityViolationException e) {
            String errorMessage = e.getMessage();
            if (errorMessage.contains("Duplicate entry") && errorMessage.contains("email")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Email đã được sử dụng bởi tài khoản khác"));
            } else if (errorMessage.contains("Duplicate entry") && errorMessage.contains("phone")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Số điện thoại đã được sử dụng bởi tài khoản khác"));
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Lỗi khi cập nhật thông tin người dùng"));
        }
    }

    public ResponseEntity<TokenResponse> refresh(String refreshToken) {
        try {
            if (!tokenService.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(null);
            }

            String username = tokenService.getUsernameFromToken(refreshToken);
            UserEntity user = userRepository.findByUsername(username);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(username, null, getAuthorities(user));

            String newAccessToken = jwtTokenUtil.createAccessToken(authentication);
            String newRefreshToken = jwtTokenUtil.createRefreshToken(authentication);

            TokenEntity token = new TokenEntity();
            token.setUserName(username);
            token.setAccessToken(newAccessToken);
            token.setRefreshToken(newRefreshToken);
            tokenService.saveToken(token);

            TokenResponse tokenResponse = new TokenResponse();
            tokenResponse.setAccessToken(newAccessToken);
            tokenResponse.setRefreshToken(newRefreshToken);
            tokenResponse.setUserId(user.getId());

            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }
    }

    private Collection<GrantedAuthority> getAuthorities(UserEntity user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }


}
