package com.phone.store.backend.controller;

import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.respository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @GetMapping()
    public List<ProductEntity> products() {
        return productRepository.findAll();
    }
}
