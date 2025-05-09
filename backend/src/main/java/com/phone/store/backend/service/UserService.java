package com.phone.store.backend.service;

import com.phone.store.backend.converter.UserConverter;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter userConverter;

    public UserResponse getUserEntityById(long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return userConverter.convertToResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        List<UserEntity> list = userRepository.findAll();
        List<UserResponse> userResponses = new ArrayList<>();
        for (UserEntity user : list) {
            userResponses.add(userConverter.convertToResponse(user));
        }
        return userResponses;
    }

    public UserResponse createUserEntity(@Valid UserEntity userEntity) {
        UserEntity user = userRepository.findByEmail(userEntity.getEmail());
        if (user != null) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        UserEntity userEntity1 = userRepository.save(userEntity);
        return userConverter.convertToResponse(userEntity1);
    }

    public ResponseEntity<?> blockUser(long id) {
        Optional<UserEntity> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy người dùng", 404));
        }

        UserEntity user = userOptional.get();
        user.setEnabled(false);
        userRepository.save(user);

        return ResponseEntity.ok(new StatusResponse("Khóa tài khoản thành công", 200));
    }
}
