package com.phone.store.backend.respository;

import com.phone.store.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRespository extends JpaRepository<ProductEntity, Long> {
}
