package com.phone.store.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private String image;
    private String price;
    private String ram;
    private String rom;
    private String colorName;
}
