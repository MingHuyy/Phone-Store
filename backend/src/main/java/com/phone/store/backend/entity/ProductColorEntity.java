package com.phone.store.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_colors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductColorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String colorName;

    private String image;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;
}