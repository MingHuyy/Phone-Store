package com.phone.store.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userName;

    @Column(nullable = false, unique = true)
    private String accessToken;

    @Column(nullable = false, unique = true)
    private String refreshToken;
}
