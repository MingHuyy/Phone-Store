package com.phone.store.backend.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TokenDTO {
    private String refreshToken;
}

