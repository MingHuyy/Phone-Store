package com.phone.store.backend.model.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductRequest {
    private String name;
    private String description;
    private Integer stock;
    private String category;
    private ProductDetailRequest detail;
    private List<ProductVariantRequest> variants;
    private List<ProductColorRequest> colors;
}