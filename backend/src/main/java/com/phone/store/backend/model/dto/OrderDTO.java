package com.phone.store.backend.model.dto;

import com.phone.store.backend.entity.OrderEntity;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OrderDTO {
    private String fullName;
    private String phone;
    private String address;
    private String paymentMethod;
    private List<OrderItemDTO> orderItems;
    private Long totalAmount;
}