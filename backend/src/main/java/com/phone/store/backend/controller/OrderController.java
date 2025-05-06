package com.phone.store.backend.controller;

import com.phone.store.backend.model.dto.OrderDTO;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.service.OrderService;
import com.phone.store.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO orderDTO) {
        System.out.println(orderDTO);
        return orderService.createOrder(orderDTO);
    }

    @GetMapping
    public ResponseEntity<?> getOrders() {
        return orderService.getOrdersByUserId();
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long orderId) {
        return orderService.getOrderById(orderId);
    }
}