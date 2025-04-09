package com.phone.store.backend.service.impl;

import com.phone.store.backend.config.VNPayConfig;
import com.phone.store.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private VNPayConfig vnpayConfig;

    @Override
    public String createPaymentUrl(long orderId, long amount, String orderInfo, String ipAddress) {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnpayConfig.getVnp_Version());
        vnp_Params.put("vnp_Command", vnpayConfig.getVnp_Command());
        vnp_Params.put("vnp_TmnCode", vnpayConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // Nhân 100 vì VNPay tính bằng 100 đồng
        vnp_Params.put("vnp_CurrCode", "VND");

        // Mã giao dịch
        vnp_Params.put("vnp_TxnRef", String.valueOf(orderId));

        // Thông tin đơn hàng
        vnp_Params.put("vnp_OrderInfo", orderInfo);

        // Ngôn ngữ tiếng Việt
        vnp_Params.put("vnp_Locale", "vn");

        // Loại hàng hóa
        vnp_Params.put("vnp_OrderType", vnpayConfig.getOrderType());

        // URL trả về
        vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getVnp_ReturnUrl());

        // IP của khách hàng
        vnp_Params.put("vnp_IpAddr", ipAddress);

        // Thời gian tạo giao dịch
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Thời gian hết hạn giao dịch
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sắp xếp tham số theo thứ tự tăng dần
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        // Tạo chuỗi query
        StringBuilder query = new StringBuilder();
        StringBuilder hashData = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                // Tạo chuỗi hash
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }

                // Tạo chuỗi query
                try {
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = vnpayConfig.hmacSHA512(vnpayConfig.getSecretKey(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnpayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
