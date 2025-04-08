package com.phone.store.backend.service.impl;

import com.phone.store.backend.Converter.OrderConverter;
import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.entity.OrderItemEntity;
import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.OrderDTO;
import com.phone.store.backend.model.dto.OrderItemDTO;
import com.phone.store.backend.model.response.OrderItemResponse;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.OrderItemRepository;
import com.phone.store.backend.respository.OrderRepository;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

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

    @Override
    @Transactional
    public ResponseEntity<?> createOrder(OrderDTO orderDTO, Long userId) {
        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy thông tin người dùng", 404));
        }

        UserEntity user = userOptional.get();

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setTotalPrice(orderDTO.getTotalAmount());
        order.setAddress(orderDTO.getAddress());
        order.setPhoneNumber(orderDTO.getPhone());

        OrderEntity.PaymentStatus paymentStatus = OrderEntity.PaymentStatus.COD;
        if ("online".equals(orderDTO.getPaymentMethod())) {
            paymentStatus = OrderEntity.PaymentStatus.COMPLETED;
        }
        order.setPaymentStatus(paymentStatus);

        OrderEntity savedOrder = orderRepository.save(order);

        List<OrderItemEntity> orderItems = new ArrayList<>();
        for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            Optional<ProductEntity> productOptional = productRepository.findById(itemDTO.getProductId());
            if (productOptional.isEmpty()) {
                continue;
            }

            ProductEntity product = productOptional.get();
            if (product.getStock() < itemDTO.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Sản phẩm " + product.getName() + " không đủ hàng", 400));
            }

            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrderEntity(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);

        return ResponseEntity.ok(new StatusResponse("Đặt hàng thành công", 200));
    }

    @Override
    public ResponseEntity<List<OrderResponse>> getOrdersByUserId(Long userId) {
        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<OrderEntity> orders = orderRepository.findByUserId(userId);
        List<OrderResponse> orderResponses = new ArrayList<>();

        for (OrderEntity order : orders) {
            OrderResponse response = orderConverter.convertToOrderResponse(order);
            orderResponses.add(response);
        }

        return ResponseEntity.ok(orderResponses);
    }

    @Override
    public ResponseEntity<OrderResponse> getOrderById(Long orderId, Long userId) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(orderId);
        if (orderOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        OrderEntity order = orderOptional.get();
        if (!order.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        OrderResponse response =orderConverter.convertToOrderResponse(order);
        return ResponseEntity.ok(response);
    }
}