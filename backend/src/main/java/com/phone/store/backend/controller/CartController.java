package com.phone.store.backend.controller;

import com.phone.store.backend.entity.CartEntity;
import com.phone.store.backend.model.dto.CartDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.CartRepository;
import com.phone.store.backend.service.CartService;
import com.phone.store.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private CartRepository cartRepository;

    @GetMapping
    public ResponseEntity<?> getCart() {
        return cartService.getCart();
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody CartDTO cartDTO) {
        return cartService.addToCart(cartDTO);
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartId) {
        Optional<CartEntity> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        return cartService.removeFromCart(cartId);
    }

    @DeleteMapping("/items")
    public ResponseEntity<?> removeMultipleItems(Authentication authentication, @RequestBody List<Long> cartIds) {
        Long userId = getUserIdFromAuthentication(authentication);
        if (cartIds == null || cartIds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Danh sách rỗng", 400));
        }

        List<Long> removedIds = new ArrayList<>();
        List<Long> failedIds = new ArrayList<>();

        for (Long cartId : cartIds) {
            Optional<CartEntity> cartOptional = cartRepository.findById(cartId);
            if (cartOptional.isEmpty() || !cartOptional.get().getUser().getId().equals(userId)) {
                failedIds.add(cartId);
                continue;
            }

            cartRepository.deleteById(cartId);
            removedIds.add(cartId);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("removed", removedIds);
        response.put("failed", failedIds);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<?> updateCartQuantity(@RequestBody CartDTO cartDTO) {
        return cartService.updateCartQuantity(cartDTO);
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }
}
