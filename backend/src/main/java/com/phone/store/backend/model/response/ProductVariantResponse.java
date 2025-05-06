package com.phone.store.backend.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantResponse {
    private Long id;
    private String ram;
    private String rom;
    private Long price;
}