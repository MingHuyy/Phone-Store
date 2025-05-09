package com.phone.store.backend.model.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductVariantRequest {
    private String ram;
    private String rom;
    private Long price;
}