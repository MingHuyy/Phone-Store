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
    private Long colorId;
    private Long variantId;
    private Long price;

    @Override
    public String toString() {
        return "CartDTO{" +
                "productId=" + productId +
                ", quantity=" + quantity +
                ", colorId=" + colorId +
                ", variantId=" + variantId +
                ", price=" + price +
                '}';
    }

}
