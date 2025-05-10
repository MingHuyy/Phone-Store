package com.phone.store.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productdetails")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Column(nullable = false)
    private String screen;

    @Column(nullable = false)
    private String os;

    @Column(nullable = false)
    private String camera;

    @Column(nullable = false)
    private String cameraFront;

    @Column(nullable = false)
    private String cpu;

    @Column(nullable = false)
    private String battery;
}
