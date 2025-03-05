package com.phone.store.backend.Converter;

import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class UserConverter {
    @Autowired
    private ModelMapper modelMapper;

    public UserResponse convertToResponse(UserEntity userEntity) {
        return modelMapper.map(userEntity, UserResponse.class);
    }

    public UserEntity convertToEntity(UserResponse userResponse) {
        return modelMapper.map(userResponse, UserEntity.class);
    }
}
