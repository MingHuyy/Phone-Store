package com.phone.store.backend.service;

import com.phone.store.backend.converter.OrderConverter;
import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.entity.OrderItemEntity;
import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.request.OrderRequest;
import com.phone.store.backend.model.request.OrderItemRequest;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.OrderItemRepository;
import com.phone.store.backend.respository.OrderRepository;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderConverter orderConverter;

    public ResponseEntity<?> getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy thông tin xác thực", 401));
        }

        String name = authentication.getName();
        UserEntity user = userRepository.findByUsername(name);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy người dùng.", 404));
        }

        return ResponseEntity.ok(user);
    }

    @Transactional
    public ResponseEntity<?> createOrder(OrderRequest orderRequest) {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setFullName(orderRequest.getFullName());
        order.setTotalPrice(orderRequest.getTotalAmount());
        order.setAddress(orderRequest.getAddress());
        order.setPhoneNumber(orderRequest.getPhone());

        OrderEntity.PaymentStatus paymentStatus = OrderEntity.PaymentStatus.COD;
        if ("online".equals(orderRequest.getPaymentMethod())) {
            paymentStatus = OrderEntity.PaymentStatus.COMPLETED;
        }
        order.setPaymentStatus(paymentStatus);

        OrderEntity savedOrder = orderRepository.save(order);

        List<OrderItemEntity> orderItems = new ArrayList<>();
        for (OrderItemRequest itemRequest : orderRequest.getOrderItems()) {
            Optional<ProductEntity> productOptional = productRepository.findById(itemRequest.getProductId());
            if (productOptional.isEmpty()) {
                continue;
            }

            ProductEntity product = productOptional.get();
            if (product.getStock() < itemRequest.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Sản phẩm " + product.getName() + " không đủ hàng", 400));
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderEntity(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(itemRequest.getPrice());
            orderItem.setProductImage(itemRequest.getProductImage());
            orderItem.setColor(itemRequest.getColorName());

            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);

        StatusResponse res = new StatusResponse("Đặt hàng thành công", 200);
        return ResponseEntity.ok(res);
    }

    public ResponseEntity<?> getOrdersByUserId() {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        List<OrderEntity> orders = orderRepository.findByUserId(user.getId());
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (OrderEntity order : orders) {
            OrderResponse res = orderConverter.convertToOrderResponse(order);
            orderResponses.add(res);
        }

        return ResponseEntity.ok(orderResponses);
    }

    public ResponseEntity<?> getOrderById(Long orderId) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        OrderEntity order = orderOptional.get();
        OrderResponse orderResponse = orderConverter.convertToOrderResponse(order);
        return ResponseEntity.ok(orderResponse);
    }

    public ResponseEntity<?> createOrderv1(OrderRequest orderRequest) {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setTotalPrice(orderRequest.getTotalAmount());
        order.setAddress(orderRequest.getAddress());
        order.setPhoneNumber(orderRequest.getPhone());
        order.setFullName(orderRequest.getFullName());
        order.setPaymentStatus("online".equals(orderRequest.getPaymentMethod())
                ? OrderEntity.PaymentStatus.COMPLETED
                : OrderEntity.PaymentStatus.COD);

        OrderEntity savedOrder = orderRepository.save(order);

        List<OrderItemEntity> orderItems = new ArrayList<>();

        for (OrderItemRequest itemRequest : orderRequest.getOrderItems()) {
            ProductEntity product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(
                            () -> new RuntimeException("Không tìm thấy sản phẩm ID: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Sản phẩm " + product.getName() + " không đủ hàng", 400));
            }

            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderEntity(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(itemRequest.getPrice());
            orderItem.setProductImage(itemRequest.getProductImage());
            orderItem.setColor(itemRequest.getColorName());

            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);
        return ResponseEntity.ok(savedOrder);
    }
}