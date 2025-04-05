package com.phone.store.backend.service;

import com.phone.store.backend.model.dto.CartDTO;
import com.phone.store.backend.model.response.CartResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface CartService {
    ResponseEntity<List<CartResponse>> getCart(String accessToken);

    ResponseEntity<?> addToCart(CartDTO request, Long userId);

    ResponseEntity<?> removeFromCart(Long cartId);

    ResponseEntity<?> updateCartQuantity(CartDTO request, Long userId);
//
}
