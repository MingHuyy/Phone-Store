package com.phone.store.backend.service;

import com.phone.store.backend.model.dto.LoginDTO;

public interface AuthService {
    LoginDTO login(LoginDTO loginDTO);
}
