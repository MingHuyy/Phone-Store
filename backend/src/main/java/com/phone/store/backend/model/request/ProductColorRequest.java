package com.phone.store.backend.model.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductColorRequest {
    private String colorName;
    private String imageUrl;
}