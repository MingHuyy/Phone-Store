package com.phone.store.backend.entity;

import com.phone.store.backend.model.response.ColorResponse;
import com.phone.store.backend.model.response.ProductDetailResponse;
import com.phone.store.backend.model.response.ProductVariantResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class ProductEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private String category;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL)
    private ProductDetailEntity productDetail;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariantEntity> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductColorEntity> colors = new ArrayList<>();

    public ProductDetailResponse getProductDetailResponse() {
        ProductDetailResponse productDetailResponse = new ProductDetailResponse();
        if (productDetail != null) {
            productDetailResponse.setId(this.id);
            productDetailResponse.setName(this.name);
            productDetailResponse.setDescription(this.description);
            productDetailResponse.setPrice(this.price);
            productDetailResponse.setStock(this.stock);
            productDetailResponse.setCategory(this.category);
            productDetailResponse.setOs(this.productDetail.getOs());
            productDetailResponse.setCpu(this.productDetail.getCpu());
            productDetailResponse.setBattery(this.productDetail.getBattery());
            productDetailResponse.setCamera(this.productDetail.getCamera());
            productDetailResponse.setCameraFront(this.productDetail.getCameraFront());
            productDetailResponse.setScreen(this.productDetail.getScreen());

            List<ColorResponse> colorResponses = new ArrayList<>();
            if (this.colors != null && !this.colors.isEmpty()) {
                for (ProductColorEntity color : this.colors) {
                    ColorResponse colorResponse = ColorResponse.builder()
                            .id(color.getId())
                            .colorName(color.getColorName())
                            .image(color.getImage())
                            .build();
                    colorResponses.add(colorResponse);
                }
            }
            productDetailResponse.setColors(colorResponses);

            List<ProductVariantResponse> variantResponses = new ArrayList<>();
            if (this.variants != null && !this.variants.isEmpty()) {
                for (ProductVariantEntity variant : this.variants) {
                    ProductVariantResponse variantResponse = ProductVariantResponse.builder()
                            .id(variant.getId())
                            .ram(variant.getRam())
                            .rom(variant.getRom())
                            .price(variant.getPrice())
                            .build();
                    variantResponses.add(variantResponse);
                }
            }
            variantResponses.sort(Comparator.comparing(ProductVariantResponse::getPrice));
            productDetailResponse.setVariants(variantResponses);
        }
        return productDetailResponse;
    }
}