package com.phone.store.backend.controller;

import com.phone.store.backend.model.dto.OrderDTO;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.service.OrderService;
import com.phone.store.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private TokenService tokenService;

    private String extractAccessToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(HttpServletRequest request, @RequestBody OrderDTO orderDTO) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        Long userId = tokenService.getUserIdFromToken(accessToken);
        return orderService.createOrder(orderDTO, userId);
    }

    @GetMapping
    public ResponseEntity<?> getOrders(HttpServletRequest request) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        Long userId = tokenService.getUserIdFromToken(accessToken);
        return orderService.getOrdersByUserId(userId);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(HttpServletRequest request, @PathVariable Long orderId) {
        String accessToken = extractAccessToken(request);
        if (accessToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
        }

        Long userId = tokenService.getUserIdFromToken(accessToken);
        return orderService.getOrderById(orderId, userId);
    }
}