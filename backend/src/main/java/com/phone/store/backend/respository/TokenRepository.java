package com.phone.store.backend.respository;

import com.phone.store.backend.entity.TokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<TokenEntity, Long> {
    Optional<TokenEntity> findByUserName(String name);
    @Transactional
    @Modifying
    @Query("DELETE FROM TokenEntity t WHERE t.userName = :userName")
    void deleteByUserName(@Param("userName") String userName);
    TokenEntity findByRefreshToken(String refreshToken);
}
