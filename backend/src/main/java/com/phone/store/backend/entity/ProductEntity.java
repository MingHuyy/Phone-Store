package com.phone.store.backend.entity;

import com.phone.store.backend.model.response.ProductDetailResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


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

    public ProductDetailResponse getProductDetailResponse() {
        ProductDetailResponse productDetailResponse = new ProductDetailResponse();
        if (productDetail != null) {
            productDetailResponse.setName(this.name);
            productDetailResponse.setDescription(this.description);
            productDetailResponse.setPrice(this.price);
            productDetailResponse.setStock(this.stock);
            productDetailResponse.setImage(this.image);
            productDetailResponse.setCategory(this.category);
            productDetailResponse.setOs(this.productDetail.getOs());
            productDetailResponse.setCpu(this.productDetail.getCpu());
            productDetailResponse.setBattery(this.productDetail.getBattery());
            productDetailResponse.setCamera(this.productDetail.getCamera());
            productDetailResponse.setCameraFront(this.productDetail.getCameraFront());
            productDetailResponse.setRam(this.productDetail.getRam());
            productDetailResponse.setRom(this.productDetail.getRom());
            productDetailResponse.setScreen(this.productDetail.getScreen());

        }
        return productDetailResponse;
    }
}