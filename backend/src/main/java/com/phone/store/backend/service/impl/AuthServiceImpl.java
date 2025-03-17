package com.phone.store.backend.service.impl;

import com.phone.store.backend.model.dto.LoginDTO;
import com.phone.store.backend.model.response.TokenResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.AuthService;
import com.phone.store.backend.utils.JWTTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    AuthenticationManagerBuilder authenticationManagerBuilder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    @Override
    public ResponseEntity<TokenResponse> login(LoginDTO loginDTO) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(), loginDTO.getPassword());
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        String accessToken = jwtTokenUtil.createAccessToken(authentication);
        TokenResponse jwtToken = new TokenResponse();
        jwtToken.setAccessToken(accessToken);
        return ResponseEntity.ok(jwtToken);
    }
}
