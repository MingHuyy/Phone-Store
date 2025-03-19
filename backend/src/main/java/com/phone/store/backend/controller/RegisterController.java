package com.phone.store.backend.controller;

import com.phone.store.backend.entity.RoleEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.exception.ResourceNotFoundException;
import com.phone.store.backend.model.dto.UserDTO;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.RoleRepository;
import com.phone.store.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/register")
public class RegisterController {
    Long roleUser = 2L;
    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

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

        // Nếu không gửi role, mặc định là USER
        Set<RoleEntity> roles = new HashSet<>();
        RoleEntity roleEntity = roleRepository.findById(roleUser)
                .orElseThrow(() -> new ResourceNotFoundException("Role does not exist!"));
        roles.add(roleEntity);
        userEntity.setRoles(roles);
        return userService.createUserEntity(userEntity);
    }
}
