package com.phone.store.backend.model.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartResponse {

    private Long id;
    private String productName;
    private int quantity;
    private String image;
    private String price;
    private String ram;
    private String rom;
}
