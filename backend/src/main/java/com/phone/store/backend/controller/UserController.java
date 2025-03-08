package com.phone.store.backend.controller;


import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private  UserService userService;

    @Autowired
    private  UserRepository userRepository;

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable long id) {
        return userService.getUserEntityById(id);
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        System.out.println(userService.getAllUsers().size());
        return userService.getAllUsers();
    }

}
