package com.phone.store.backend.model.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductDetailResponse {

    private Long id;

    private String name;

    private String description;

    private Long price;

    private int stock;

    private String image;

    private String category;

    private String screen;

    private String os;

    private String camera;

    private String cameraFront;

    private String cpu;

    private String ram;

    private String rom;

    private String battery;

    private List<ProductVariantResponse> variants;

    private List<ColorResponse> colors;
}
