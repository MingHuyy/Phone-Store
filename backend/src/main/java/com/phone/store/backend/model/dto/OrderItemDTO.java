package com.phone.store.backend.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderItemDTO {
    private Long productId;
    private Integer quantity;
    private Long price;
    private String productName;
    private String productImage;
    private String colorName;
    }