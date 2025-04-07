package com.phone.store.backend.service;

import com.phone.store.backend.model.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ProductService {
    ResponseEntity<Page<ProductResponse>> getProducts(int page,
                                                      int size,
                                                      String sort,
                                                      Long minPrice,
                                                      Long maxPrice,
                                                      String search,
                                                      List<String> categories);


    ResponseEntity<Page<ProductResponse>> searchProduct(String keyword, int page, int size);
}
