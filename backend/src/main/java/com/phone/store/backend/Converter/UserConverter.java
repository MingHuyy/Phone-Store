package com.phone.store.backend.Converter;

import com.phone.store.backend.entity.RoleEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.response.UserResponse;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserConverter {
    @Autowired
    private ModelMapper modelMapper;

    public UserResponse convertToResponse(UserEntity userEntity) {
        UserResponse userResponse = modelMapper.map(userEntity, UserResponse.class);
        Set<RoleEntity> roleEntities = userEntity.getRoles();
        String roles = roleEntities.stream()
                .map(RoleEntity::getName)
                .collect(Collectors.joining(","));
        userResponse.setRoles(roles);
        return userResponse;
    }

    public UserEntity convertToEntity(UserResponse userResponse) {
        return modelMapper.map(userResponse, UserEntity.class);
    }
}
