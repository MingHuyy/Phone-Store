package com.phone.store.backend.respository;

import com.phone.store.backend.entity.ProductColorEntity;
import com.phone.store.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductColorRepository extends JpaRepository<ProductColorEntity, Long> {
}