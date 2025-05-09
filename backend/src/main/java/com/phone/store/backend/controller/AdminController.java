package com.phone.store.backend.controller;


import com.phone.store.backend.converter.OrderConverter;
import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.model.request.ProductRequest;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.OrderRepository;
import com.phone.store.backend.service.ProductService;
import com.phone.store.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderConverter orderConverter;

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable long id) {
        return productService.deleteProduct(id);
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest productRequest) {
        return productService.createProduct(productRequest);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest productRequest) {
        return productService.updateProduct(id, productRequest);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<OrderEntity> orders = orderRepository.findAll();
        System.out.println("=================" + orders.size());
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (OrderEntity order : orders) {
            OrderResponse res = orderConverter.convertToOrderResponse(order);
            orderResponses.add(res);
        }

        return ResponseEntity.ok(orderResponses);
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable long id) {
        return userService.blockUser(id);
    }

}
