package com.phone.store.backend.controller;

import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.model.response.ProductDetailResponse;
import com.phone.store.backend.model.response.ProductResponse;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    @GetMapping("")
    public List<ProductResponse> products() {
        return productRepository.findV1();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> productById(@PathVariable long id) {
        Optional<ProductEntity> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            ProductEntity product = productOptional.get();
            ProductDetailResponse productDetailResponse = product.getProductDetailResponse();
            return ResponseEntity.ok(productDetailResponse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/v1")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categories
    ) {

        return productService.getProducts(page, size, sort, minPrice, maxPrice, search, categories);

    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = productRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
    }
}
