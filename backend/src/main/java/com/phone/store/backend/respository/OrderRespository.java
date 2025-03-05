package com.phone.store.backend.respository;

import com.phone.store.backend.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRespository extends JpaRepository<OrderEntity, Long> {
}
