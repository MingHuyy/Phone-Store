package com.phone.store.backend.respository;

import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.entity.ProductVariantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariantEntity, Long> {
}