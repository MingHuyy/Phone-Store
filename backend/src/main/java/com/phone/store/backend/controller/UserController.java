package com.phone.store.backend.controller;

import com.phone.store.backend.Converter.UserConverter;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.UserDTO;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.TokenService;
import com.phone.store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserConverter userConverter;

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable long id) {
        return userService.getUserEntityById(id);
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

}
