package com.phone.store.backend.service;

import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;


public interface UserService {
    UserEntity getUserEntityById(long id);
}
