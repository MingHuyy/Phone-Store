package com.phone.store.backend.service;

import com.phone.store.backend.entity.*;
import com.phone.store.backend.model.request.ProductColorRequest;
import com.phone.store.backend.model.request.ProductDetailRequest;
import com.phone.store.backend.model.request.ProductVariantRequest;
import com.phone.store.backend.model.response.ProductResponse;
import com.phone.store.backend.respository.OrderItemRepository;
import com.phone.store.backend.respository.ProductColorRepository;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.respository.ProductVariantRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import com.phone.store.backend.model.request.ProductRequest;
import com.phone.store.backend.model.response.StatusResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductColorRepository productColorRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    public ResponseEntity<Page<ProductResponse>> getProducts(int page,
            int size,
            String sort,
            Long minPrice,
            Long maxPrice,
            String search,
            List<String> categories) {
        PageRequest pageable = PageRequest.of(page, size);

        if (sort != null) {
            switch (sort) {
                case "price_asc":
                    pageable = PageRequest.of(page, size, Sort.by("price").ascending());
                    break;
                case "price_desc":
                    pageable = PageRequest.of(page, size, Sort.by("price").descending());
                    break;
                case "name_asc":
                    pageable = PageRequest.of(page, size, Sort.by("name").ascending());
                    break;
                case "name_desc":
                    pageable = PageRequest.of(page, size, Sort.by("name").descending());
                    break;
                default:
                    pageable = PageRequest.of(page, size, Sort.by("id").descending());
            }
        }

        Specification<ProductEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (search != null && !search.isEmpty()) {
                predicates.add(cb.like(root.get("name"), "%" + search + "%"));
            }

            if (categories != null && !categories.isEmpty()) {
                predicates.add(root.get("category").in(categories));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<ProductEntity> productPage = productRepository.findAll(spec, pageable);

        Page<ProductResponse> response = productPage.map(product -> {
            product.getVariants().sort(Comparator.comparing(ProductVariantEntity::getPrice));

            ProductVariantEntity cheapestVariant = product.getVariants().get(0);

            return ProductResponse.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(cheapestVariant.getPrice())
                    .stock(product.getStock())
                    .image(product.getImage())
                    .category(product.getCategory())
                    .build();
        });

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Page<ProductResponse>> searchProduct(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<ProductResponse> productResponses = productRepository.findByKeyword(keyword, pageable);
        return ResponseEntity.ok(productResponses);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> createProduct(ProductRequest productRequest) {
        try {
            ProductEntity product = new ProductEntity();
            product.setName(productRequest.getName());
            product.setDescription(productRequest.getDescription());
            product.setStock(productRequest.getStock());
            product.setCategory(productRequest.getCategory());

            ProductDetailEntity productDetail = new ProductDetailEntity();
            ProductDetailRequest detailRequest = productRequest.getDetail();
            productDetail.setScreen(detailRequest.getScreen());
            productDetail.setOs(detailRequest.getOs());
            productDetail.setCamera(detailRequest.getCamera());
            productDetail.setCameraFront(detailRequest.getCameraFront());
            productDetail.setCpu(detailRequest.getCpu());
            productDetail.setBattery(detailRequest.getBattery());
            productDetail.setProduct(product);

            product.setProductDetail(productDetail);

            List<String> uploadedImageUrls = new ArrayList<>();
            for (ProductColorRequest color : productRequest.getColors()) {
                if (color.getImageUrl() != null && !color.getImageUrl().isEmpty()) {
                    uploadedImageUrls.add(color.getImageUrl());
                }
            }

            if (!uploadedImageUrls.isEmpty()) {
                product.setImage(uploadedImageUrls.get(0));
            } else {
                product.setImage("default-product-image.jpg");
            }

            List<ProductVariantEntity> productVariants = new ArrayList<>();
            Long lowestPrice = null;

            for (ProductVariantRequest variantRequest : productRequest.getVariants()) {
                ProductVariantEntity variant = new ProductVariantEntity();
                variant.setRam(String.valueOf(variantRequest.getRam()));
                variant.setRom(String.valueOf(variantRequest.getRom()));

                variant.setPrice(variantRequest.getPrice());
                variant.setProduct(product);

                if (lowestPrice == null || variantRequest.getPrice() < lowestPrice) {
                    lowestPrice = variantRequest.getPrice();
                }

                productVariants.add(variant);
            }

            product.setPrice(lowestPrice != null ? lowestPrice : 0L);
            product.setVariants(productVariants);

            List<ProductColorEntity> productColors = new ArrayList<>();

            for (int i = 0; i < productRequest.getColors().size(); i++) {
                ProductColorRequest colorRequest = productRequest.getColors().get(i);
                ProductColorEntity color = new ProductColorEntity();
                color.setColorName(colorRequest.getColorName());
                color.setProduct(product);

                if (colorRequest.getImageUrl() != null && !colorRequest.getImageUrl().isEmpty()) {
                    color.setImage(colorRequest.getImageUrl());
                } else {
                    color.setImage(product.getImage());
                }

                productColors.add(color);
            }
            product.setColors(productColors);

            productRepository.save(product);

            return ResponseEntity.ok(new StatusResponse("Thêm sản phẩm thành công", 200));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new StatusResponse("Lỗi khi thêm sản phẩm: " + e.getMessage(), 500));
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(long id) {
        Optional<ProductEntity> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm", 404));
        }

        List<OrderItemEntity> orderItems = orderItemRepository.findByProduct_Id(id);
        if (!orderItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Không thể xóa sản phẩm vì đang tồn tại trong đơn hàng", 400));
        }

        productRepository.deleteById(id);
        return ResponseEntity.ok(new StatusResponse("Xóa sản phẩm thành công", 200));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateProduct(Long id, ProductRequest productRequest) {
        try {
            Optional<ProductEntity> productOptional = productRepository.findById(id);
            if (productOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new StatusResponse("Không tìm thấy sản phẩm", 404));
            }

            ProductEntity product = productOptional.get();

            product.setName(productRequest.getName());
            product.setDescription(productRequest.getDescription());
            product.setStock(productRequest.getStock());
            product.setCategory(productRequest.getCategory());

            ProductDetailEntity productDetail = product.getProductDetail();
            if (productDetail == null) {
                productDetail = new ProductDetailEntity();
                productDetail.setProduct(product);
            }

            ProductDetailRequest detailRequest = productRequest.getDetail();
            if (detailRequest != null) {
                productDetail.setScreen(detailRequest.getScreen());
                productDetail.setOs(detailRequest.getOs());
                productDetail.setCamera(detailRequest.getCamera());
                productDetail.setCameraFront(detailRequest.getCameraFront());
                productDetail.setCpu(detailRequest.getCpu());
                productDetail.setBattery(detailRequest.getBattery());
            }

            product.setProductDetail(productDetail);


            if (product.getVariants() != null && !product.getVariants().isEmpty()) {
                productVariantRepository.deleteAll(product.getVariants());
            }

            List<ProductVariantEntity> newVariants = new ArrayList<>();
            Long lowestPrice = null;

            for (ProductVariantRequest variantRequest : productRequest.getVariants()) {
                ProductVariantEntity variant = new ProductVariantEntity();
                variant.setRam(variantRequest.getRam());
                variant.setRom(variantRequest.getRom());
                variant.setPrice(variantRequest.getPrice());
                variant.setProduct(product);

                if (lowestPrice == null || variantRequest.getPrice() < lowestPrice) {
                    lowestPrice = variantRequest.getPrice();
                }

                newVariants.add(variant);
            }

            product.setPrice(lowestPrice != null ? lowestPrice : 0L);

            if (product.getColors() != null && !product.getColors().isEmpty()) {
                productColorRepository.deleteAll(product.getColors());
            }

            List<ProductColorEntity> newColors = new ArrayList<>();

            for (ProductColorRequest colorRequest : productRequest.getColors()) {
                ProductColorEntity color = new ProductColorEntity();
                color.setColorName(colorRequest.getColorName());
                color.setProduct(product);

                if (colorRequest.getImageUrl() != null && !colorRequest.getImageUrl().isEmpty()) {
                    color.setImage(colorRequest.getImageUrl());
                } else {
                    color.setImage(product.getImage());
                }

                newColors.add(color);
            }

            if (!newColors.isEmpty() && newColors.get(0).getImage() != null
                    && !newColors.get(0).getImage().isEmpty()) {
                product.setImage(newColors.get(0).getImage());
            }
            if (product.getColors() != null) {
                product.getColors().clear();
            }
            if (product.getVariants() != null) {
                product.getVariants().clear();
            }

            product = productRepository.save(product);

            for (ProductVariantEntity variant : newVariants) {
                variant.setProduct(product);
            }
            product.setVariants(newVariants);
            productVariantRepository.saveAll(newVariants);

            for (ProductColorEntity color : newColors) {
                color.setProduct(product);
            }
            product.setColors(newColors);
            productColorRepository.saveAll(newColors);

            productRepository.save(product);

            return ResponseEntity.ok(new StatusResponse("Cập nhật sản phẩm thành công", 200));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new StatusResponse("Lỗi khi cập nhật sản phẩm: " + e.getMessage(), 500));
        }
    }

}
