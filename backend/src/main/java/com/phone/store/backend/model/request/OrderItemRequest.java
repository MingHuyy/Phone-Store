package com.phone.store.backend.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderItemRequest {
    private Long productId;
    private Integer quantity;
    private Long price;
    private String productName;
    private String productImage;
    private String colorName;
}