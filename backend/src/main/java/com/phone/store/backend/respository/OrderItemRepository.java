package com.phone.store.backend.respository;

import com.phone.store.backend.entity.OrderItemEntity;
import com.phone.store.backend.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrderEntityId(Long orderId);

    List<OrderItemEntity> findByProduct_Id(Long productId);
}
