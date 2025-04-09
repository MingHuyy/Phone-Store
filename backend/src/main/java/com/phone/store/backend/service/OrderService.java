package com.phone.store.backend.service;

import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.model.dto.OrderDTO;
import com.phone.store.backend.model.response.OrderResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface OrderService {
    ResponseEntity<?> createOrder(OrderDTO orderDTO, Long userId);

    ResponseEntity<List<OrderResponse>> getOrdersByUserId(Long userId);

    ResponseEntity<OrderResponse> getOrderById(Long orderId, Long userId);

    OrderEntity createOrderv1(OrderDTO orderDTO, Long userId);
}