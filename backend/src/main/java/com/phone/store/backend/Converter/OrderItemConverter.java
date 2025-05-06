package com.phone.store.backend.Converter;

import com.phone.store.backend.entity.OrderItemEntity;
import com.phone.store.backend.model.response.OrderItemResponse;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class OrderItemConverter {

    @Autowired
    private ModelMapper modelMapper;

    public OrderItemResponse convertToOrderItemResponse(OrderItemEntity orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setProductId(orderItem.getProduct().getId());
        response.setProductName(orderItem.getProduct().getName());
        response.setProductImage(orderItem.getProductImage());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        response.setColor(orderItem.getColor());
        return response;
    }
}