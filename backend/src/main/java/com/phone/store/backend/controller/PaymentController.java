package com.phone.store.backend.controller;

import com.phone.store.backend.config.VNPayConfig;
import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.OrderRepository;
import com.phone.store.backend.service.OrderService;
import com.phone.store.backend.service.PaymentService;
import com.phone.store.backend.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.phone.store.backend.model.dto.OrderDTO;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private OrderService orderService;

    private String extractAccessToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return null;
    }

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody OrderDTO orderDTO,
            HttpServletRequest request) {
        try {
            String accessToken = extractAccessToken(request);
            if (accessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new StatusResponse("Không tìm thấy token hợp lệ.", 401));
            }

            ResponseEntity<?> res = orderService.createOrderv1(orderDTO);
            if (!res.getStatusCode().is2xxSuccessful()) {
                return res;
            }
            OrderEntity orderEntity = (OrderEntity) res.getBody();
            System.out.println(orderDTO.getTotalAmount());
            String ipAddress = request.getRemoteAddr();
            String paymentUrl = paymentService.createPaymentUrl(
                    orderEntity.getId(),
                    orderDTO.getTotalAmount(),
                    "Thanh toan don hang #" + orderEntity.getId(),
                    ipAddress);

            Map<String, String> response = new HashMap<>();
            response.put("status", "OK");
            response.put("message", "Tạo URL thanh toán thành công");
            response.put("paymentUrl", paymentUrl);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new StatusResponse("Lỗi khi tạo URL thanh toán: " + e.getMessage(), 500));
        }
    }

    @GetMapping("/vnpay-payment-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) {
        Map<String, String> vnp_Params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();

        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                vnp_Params.put(paramName, paramValue);
            }
        }

        String orderId = vnp_Params.get("vnp_TxnRef");

        if (vnPayConfig.validatePaymentResponse(vnp_Params)) {
            String vnp_ResponseCode = vnp_Params.get("vnp_ResponseCode");
            if ("00".equals(vnp_ResponseCode)) {
                Optional<OrderEntity> orderOptional = orderRepository.findById(Long.parseLong(orderId));
                if (orderOptional.isPresent()) {
                    OrderEntity order = orderOptional.get();
                    order.setPaymentStatus(OrderEntity.PaymentStatus.COMPLETED);
                    orderRepository.save(order);

                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("message", "Thanh toán thành công");
                    response.put("orderId", orderId);

                    return ResponseEntity.ok(response);
                }
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Thanh toán thất bại");
                response.put("responseCode", vnp_ResponseCode);
                orderRepository.deleteById(Long.parseLong(orderId));
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Có lỗi trong quá trình xác thực thanh toán");
    }
}
