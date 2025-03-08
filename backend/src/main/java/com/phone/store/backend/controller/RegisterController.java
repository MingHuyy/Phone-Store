package com.phone.store.backend.controller;

import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.UserDTO;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/register")
public class RegisterController {
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping
    public UserResponse register(@Valid @RequestBody UserDTO userDTO) {
        String hashPassword = passwordEncoder.encode(userDTO.getPassword());

        UserEntity userEntity = new UserEntity();
        userEntity.setUsername(userDTO.getUserName());
        userEntity.setEmail(userDTO.getEmail());
        userEntity.setPassword(hashPassword);
        userEntity.setPhone(userDTO.getPhone());

        UserResponse userResponse = userService.createUserEntity(userEntity);
        System.out.println(userResponse.getUsername());
        return userResponse;
    }

}
