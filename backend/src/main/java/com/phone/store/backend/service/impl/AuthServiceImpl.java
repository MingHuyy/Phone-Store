package com.phone.store.backend.service.impl;

import com.phone.store.backend.entity.RoleEntity;
import com.phone.store.backend.entity.TokenEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.response.TokenResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.AuthService;
import com.phone.store.backend.service.TokenService;
import com.phone.store.backend.utils.JWTTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

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
}
