package com.phone.store.backend.service.impl;

import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.model.response.ProductResponse;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.service.ProductService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {


    @Autowired
    private ProductRepository productRepository;


    @Override
    public ResponseEntity<Page<ProductResponse>> getProducts(int page,
                                                             int size,
                                                             String sort,
                                                             Long minPrice,
                                                             Long maxPrice,
                                                             String search,
                                                             List<String> categories) {
        PageRequest pageable = PageRequest.of(page, size);

        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    pageable = PageRequest.of(page, size, Sort.by("price").ascending());
                    break;
                case "price_desc":
                    pageable = PageRequest.of(page, size, Sort.by("price").descending());
                    break;
                case "name_asc":
                    pageable = PageRequest.of(page, size, Sort.by("name").ascending());
                    break;
                case "name_desc":
                    pageable = PageRequest.of(page, size, Sort.by("name").descending());
                    break;
                default:
                    pageable = PageRequest.of(page, size, Sort.by("id").descending());
            }
        }

        Specification<ProductEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (search != null && !search.isEmpty()) {
                predicates.add(cb.like(root.get("name"), "%" + search + "%"));
            }

            if (categories != null && !categories.isEmpty()) {
                predicates.add(root.get("category").in(categories));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };


        Page<ProductEntity> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponse> response = productPage.map(product ->
                ProductResponse.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .description(product.getDescription())
                        .price(product.getPrice())
                        .stock(product.getStock())
                        .image(product.getImage())
                        .category(product.getCategory())
                        .build()
        );

        return ResponseEntity.ok(response);
    }
}
