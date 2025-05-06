package com.phone.store.backend.Converter;

import com.phone.store.backend.entity.OrderEntity;
import com.phone.store.backend.entity.OrderItemEntity;
import com.phone.store.backend.model.response.OrderItemResponse;
import com.phone.store.backend.model.response.OrderResponse;
import com.phone.store.backend.respository.OrderItemRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderConverter {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private OrderItemConverter orderItemConverter;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public OrderResponse convertToOrderResponse(OrderEntity order) {
        OrderResponse response = modelMapper.map(order, OrderResponse.class);
        response.setId(order.getId());
        response.setFullName(order.getFullName());
        response.setPhone(order.getPhoneNumber());
        response.setAddress(order.getAddress());
        response.setTotalPrice(order.getTotalPrice());
        response.setPaymentStatus(order.getPaymentStatus().toString());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderItemEntity> orderItems = orderItemRepository.findByOrderEntityId(order.getId());
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(orderItemConverter::convertToOrderItemResponse)
                .collect(Collectors.toList());

        response.setOrderItems(itemResponses);
        return response;
    }

}
