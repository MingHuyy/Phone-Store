package com.phone.store.backend.respository;

import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.model.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

    @Query("SELECT DISTINCT p.category FROM ProductEntity p")
    List<String> findDistinctCategories();

    @Query("SELECT new com.phone.store.backend.model.response.ProductResponse(p.id, p.name, p.description, p.price, p.stock, p.image, p.category) FROM ProductEntity p")
    List<ProductResponse> findV1();

    @Query("SELECT new com.phone.store.backend.model.response.ProductResponse(p.id, p.name, p.description, p.price, p.stock, p.image, p.category) " +
            "FROM ProductEntity p " +
            "ORDER BY p.price ASC")
    List<ProductResponse> findAllOrderByPriceAsc();


    @Query("SELECT new com.phone.store.backend.model.response.ProductResponse(p.id, p.name, p.description, p.price, p.stock, p.image, p.category) FROM ProductEntity p" +
            " where (lower(p.name) like lower(concat('%', :keyword, '%')) or :keyword is null)")
    Page<ProductResponse> findByKeyword(String keyword, Pageable pageable);
}
