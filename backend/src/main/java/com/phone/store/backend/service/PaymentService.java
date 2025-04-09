package com.phone.store.backend.service;

public interface PaymentService {
    public String createPaymentUrl(long orderId, long amount, String orderInfo, String ipAddress);

}
