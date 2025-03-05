package com.phone.store.backend.service.impl;

import com.phone.store.backend.Converter.UserConverter;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter userConverter;

    @Override
    public UserEntity getUserEntityById(long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user;
    }
}
