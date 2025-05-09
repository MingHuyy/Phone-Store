package com.phone.store.backend.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class CartRequest {
    private Long productId;
    private int quantity;
    private Long colorId;
    private Long variantId;
    private Long price;

    @Override
    public String toString() {
        return "CartRequest{" +
                "productId=" + productId +
                ", quantity=" + quantity +
                ", colorId=" + colorId +
                ", variantId=" + variantId +
                ", price=" + price +
                '}';
    }

}
