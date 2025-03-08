package com.phone.store.backend.service.impl;

import com.phone.store.backend.Converter.UserConverter;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter userConverter;



    @Override
    public UserResponse getUserEntityById(long id) {
        UserEntity user =  userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return userConverter.convertToResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<UserEntity> list = userRepository.findAll();
        List<UserResponse> userResponses = new ArrayList<>();
        for (UserEntity user : list) {
            userResponses.add(userConverter.convertToResponse(user));
        }
        return userResponses;
    }

    @Override
    public UserResponse createUserEntity(@Valid UserEntity userEntity) {
        UserEntity user = userRepository.findByEmail(userEntity.getEmail());
        if(user != null){
            throw new RuntimeException("Email đã tồn tại!");
        }
        UserEntity userEntity1 = userRepository.save(userEntity);
        return userConverter.convertToResponse(userEntity1);
    }

    @Override
    public UserResponse updateUserEntity(@Valid UserEntity userEntity) {
        UserEntity existingUser = userRepository.findById(userEntity.getId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        UserEntity userWithEmail = userRepository.findByEmail(userEntity.getEmail());
        if (userWithEmail != null) {
            throw new RuntimeException("Email đã được sử dụng bởi người khác!");
        }

        existingUser.setUsername(userEntity.getUsername());
        existingUser.setEmail(userEntity.getEmail());
        existingUser.setPhone(userEntity.getPhone());

        UserEntity updatedUser = userRepository.save(existingUser);

        return userConverter.convertToResponse(updatedUser);
    }


}
