package com.phone.store.backend.respository;


import com.phone.store.backend.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRespository extends JpaRepository<OrderItemEntity, Long> {
}
