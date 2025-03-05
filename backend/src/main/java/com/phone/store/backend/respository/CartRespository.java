package com.phone.store.backend.respository;


import com.phone.store.backend.entity.CartEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRespository extends JpaRepository<CartEntity, Long> {
}
