package com.phone.store.backend.Converter;


import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.model.response.ProductResponse;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductConverter {

    @Autowired
    private ModelMapper modelMapper;

    public ProductResponse converterToResponse(ProductEntity productEntity) {
        ProductResponse productResponse = modelMapper.map(productEntity, ProductResponse.class);
//        productResponse.setId(productEntity.getId());
//        productResponse.setName(productEntity.getName());
//        productResponse.setDescription(productEntity.getDescription());
//        productResponse.setPrice(productEntity.getPrice());
//        productResponse.setCategory(productEntity.getCategory());
//        productResponse.setImage(productEntity.getImage());
        return productResponse;
    }

}
