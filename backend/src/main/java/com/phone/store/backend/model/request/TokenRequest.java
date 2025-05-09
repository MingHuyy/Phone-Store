package com.phone.store.backend.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class TokenRequest {
    private String refreshToken;
}
