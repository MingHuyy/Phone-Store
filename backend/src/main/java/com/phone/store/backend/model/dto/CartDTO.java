package com.phone.store.backend.model.dto;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CartDTO {
    private Long productId;
    private int quantity;
}
