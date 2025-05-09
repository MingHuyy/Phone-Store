package com.phone.store.backend.model.request;

import com.phone.store.backend.entity.OrderEntity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderRequest {
    private String fullName;
    private String phone;
    private String address;
    private String paymentMethod;
    private List<OrderItemRequest> orderItems;
    private Long totalAmount;
}