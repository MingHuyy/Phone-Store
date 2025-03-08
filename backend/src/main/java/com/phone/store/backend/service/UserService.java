package com.phone.store.backend.service;

import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;

import java.util.List;


public interface UserService {
    UserResponse getUserEntityById(long id);

    List<UserResponse> getAllUsers();

    UserResponse createUserEntity(UserEntity userEntity);

    UserResponse updateUserEntity(UserEntity userEntity);
}

