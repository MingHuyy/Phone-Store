package com.phone.store.backend.model.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductDetailRequest {
    private String screen;
    private String os;
    private String camera;
    private String cameraFront;
    private String cpu;
    private String battery;
}