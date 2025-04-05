package com.phone.store.backend.controller;

import com.phone.store.backend.entity.CartEntity;
import com.phone.store.backend.model.dto.CartDTO;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.CartRepository;
import com.phone.store.backend.service.CartService;
import com.phone.store.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    private String extractAccessToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7); // Bỏ "Bearer "
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getCart(HttpServletRequest request) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }
        return cartService.getCart(accessToken);
    }

    @PostMapping
    public ResponseEntity<?> addToCart(HttpServletRequest request, @RequestBody CartDTO cartDTO) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }
        System.out.println("fhjakfhakks" + cartDTO.getProductId() + " " + cartDTO.getQuantity());
        long userId = tokenService.getUserIdFromToken(accessToken);
        return cartService.addToCart(cartDTO, userId);
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeFromCart(HttpServletRequest request, @PathVariable Long cartId) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        Optional<CartEntity> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        return cartService.removeFromCart(cartId);
    }

    @DeleteMapping("/items")
    public ResponseEntity<?> removeMultipleItems(HttpServletRequest request, @RequestBody List<Long> cartIds) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        long userId = tokenService.getUserIdFromToken(accessToken);

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
    public ResponseEntity<?> updateCartQuantity(HttpServletRequest request, @RequestBody CartDTO cartDTO) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }
        long userId = tokenService.getUserIdFromToken(accessToken);
        return cartService.updateCartQuantity(cartDTO, userId);
    }
}
