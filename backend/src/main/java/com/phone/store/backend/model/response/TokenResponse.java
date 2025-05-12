package com.phone.store.backend.model.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String role;
    private String message;

    public TokenResponse(String message) {
        this.message = message;
    }
}
