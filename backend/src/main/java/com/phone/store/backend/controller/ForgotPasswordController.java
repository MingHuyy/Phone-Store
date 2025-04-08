package com.phone.store.backend.controller;

import com.phone.store.backend.entity.TokenEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.respository.TokenRepository;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.MailService;
import com.phone.store.backend.utils.JWTTokenUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/forgotpassword")
public class ForgotPasswordController {

    private Collection<GrantedAuthority> getAuthorities(UserEntity user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private MailService mailService;
    @PostMapping
    public void forgotPassword(@RequestBody Map<String, String> requestBody) throws MessagingException, UnsupportedEncodingException {
        String email = requestBody.get("email");
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("Email bạn nhập chưa được dùng để đăng ký, vui lòng kiểm tra lại!");
        }
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, getAuthorities(user));
        String refreshToken = jwtTokenUtil.createRefreshToken(authentication);
        String accessToken = jwtTokenUtil.createAccessToken(authentication);
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setAccessToken(accessToken);
        tokenEntity.setRefreshToken(refreshToken);
        tokenEntity.setUserName(user.getUsername());
        tokenRepository.save(tokenEntity);
        mailService.sendLink(email, refreshToken);
    }
}
