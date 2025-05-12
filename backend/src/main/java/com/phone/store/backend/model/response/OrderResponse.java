package com.phone.store.backend.model.response;

import com.phone.store.backend.entity.OrderEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String address;
    private Long totalPrice;
    private String paymentStatus;
    private String orderStatus;
    private Date createdAt;
    private List<OrderItemResponse> orderItems;
}
