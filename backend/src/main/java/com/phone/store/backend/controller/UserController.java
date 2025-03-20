package com.phone.store.backend.controller;


import com.phone.store.backend.Converter.UserConverter;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.TokenService;
import com.phone.store.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private  UserService userService;

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserConverter userConverter;

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable long id) {
        return userService.getUserEntityById(id);
    }

    @GetMapping("/all")
    public List<UserResponse> getAllUsers() {
        System.out.println(userService.getAllUsers().size());
        return userService.getAllUsers();
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Không tìm thấy token hợp lệ."));
        }

        String accessToken = authorizationHeader.substring(7);

        try {
            String userName = tokenService.getUsernameFromToken(accessToken);

            UserEntity user = userRepository.findByUsername(userName);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Không tìm thấy người dùng."));
            }

            UserResponse userResponse = userConverter.convertToResponse(user);
            String role = userResponse.getRoles();
            System.out.println(role);
            return ResponseEntity.ok(userResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token không hợp lệ hoặc đã hết hạn."));
        }
    }

}
