package com.phone.store.backend.controller;

import com.phone.store.backend.converter.OrderConverter;
import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.model.request.ProductRequest;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.model.response.UserResponse;
import com.phone.store.backend.respository.OrderRepository;
import com.phone.store.backend.service.MailService;
import com.phone.store.backend.service.ProductService;
import com.phone.store.backend.service.UserService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @Autowired
    private MailService mailService;

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

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status,
            @RequestBody(required = false) Map<String, String> requestBody) {
        Optional<OrderEntity> orderOptional = orderRepository.findById(id);
        if (orderOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy đơn hàng", 404));
        }

        OrderEntity order = orderOptional.get();

        try {
            OrderEntity.OrderStatus orderStatus = OrderEntity.OrderStatus.valueOf(status.toUpperCase());
            order.setOrderStatus(orderStatus);
            OrderEntity updatedOrder = orderRepository.save(order);
            OrderResponse orderResponse = orderConverter.convertToOrderResponse(updatedOrder);
            if (requestBody != null && requestBody.containsKey("message")) {
                String message = requestBody.get("message");
                mailService.sendOrderStatusMessage(order.getUser().getEmail(), id, order.getFullName(), order.getAddress(), status, message);
            }
            return ResponseEntity.ok(orderResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse(
                            "Trạng thái không hợp lệ. Các trạng thái hợp lệ: PROCESSING, SHIPPING, COMPLETED, CANCELLED",
                            400));
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
