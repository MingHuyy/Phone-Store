package com.phone.store.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
@Getter
public class VNPayConfig {
    @Value("${spring.vnpay-url}")
    private String vnp_PayUrl;

    @Value("${spring.vnpay-returnUrl}")
    private String vnp_ReturnUrl;

    @Value("${spring.vnpay-tmcode}")
    private String vnp_TmnCode;

    @Value("${spring.vnpay-secretKey}")
    private String secretKey;

    @Value("${spring.vnpay-version}")
    private String vnp_Version;

    @Value("${spring.vnpay-command}")
    private String vnp_Command;

    @Value("${spring.vnpay-orderType}")
    private String orderType;

    public String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] hmacData = hmac.doFinal(data.getBytes());
            return bytesToHex(hmacData);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public boolean validatePaymentResponse(Map<String, String> vnp_Params) {
        String vnp_SecureHash = vnp_Params.get("vnp_SecureHash");

        if (vnp_Params.containsKey("vnp_SecureHash")) {
            vnp_Params.remove("vnp_SecureHash");
        }

        if (vnp_Params.containsKey("vnp_SecureHashType")) {
            vnp_Params.remove("vnp_SecureHashType");
        }
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }

                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }

        String calculatedHash = hmacSHA512(this.secretKey, hashData.toString());
        return calculatedHash.equals(vnp_SecureHash);
    }

    public Map<String, String> buildVNPayParams(String orderId, long amount, String orderInfo, String ipAddress) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", this.getVnp_Version());
        params.put("vnp_Command", this.getVnp_Command());
        params.put("vnp_TmnCode", this.getVnp_TmnCode());
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_Locale", "vn");
        params.put("vnp_TxnRef", orderId);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_ReturnUrl", this.getVnp_ReturnUrl());

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        return params;
    }

    public String buildHashData(Map<String, String> params, List<String> sortedKeys) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sortedKeys.size(); i++) {
            String key = sortedKeys.get(i);
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                try {
                    sb.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()));
                    if (i < sortedKeys.size() - 1) {
                        sb.append("&");
                    }
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
        }
        return sb.toString();
    }

    public String buildQueryString(Map<String, String> params, List<String> sortedKeys) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < sortedKeys.size(); i++) {
            String key = sortedKeys.get(i);
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                try {
                    sb.append(URLEncoder.encode(key, StandardCharsets.UTF_8.toString()))
                            .append("=")
                            .append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()));
                    if (i < sortedKeys.size() - 1) {
                        sb.append("&");
                    }
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
        }
        return sb.toString();
    }


}
