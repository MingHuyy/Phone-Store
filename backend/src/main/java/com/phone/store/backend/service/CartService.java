package com.phone.store.backend.service;

import com.phone.store.backend.entity.*;
import com.phone.store.backend.model.request.CartRequest;
import com.phone.store.backend.model.response.CartResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private ProductColorRepository productColorRepository;

    public ResponseEntity<?> getUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new StatusResponse("Không tìm thấy thông tin xác thực", 401));
        }

        String name = authentication.getName();
        UserEntity user = userRepository.findByUsername(name);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy người dùng.", 404));
        }

        return ResponseEntity.ok(user);
    }


    public ResponseEntity<?> getCart() {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        List<CartEntity> cartItems = cartRepository.findCartByUserId(user.getId());
        List<CartResponse> cartResponses = new ArrayList<>();

        for (CartEntity cart : cartItems) {

            ProductVariantEntity variant = productVariantRepository.findById(cart.getVariantId())
                    .orElseThrow(() -> new EntityNotFoundException("Variant not found"));

            ProductColorEntity color = productColorRepository.findById(cart.getColorId())
                    .orElseThrow(() -> new EntityNotFoundException("Color not found"));

            CartResponse cartResponse = new CartResponse();
            cartResponse.setId(cart.getId());
            cartResponse.setProductId(cart.getProduct().getId());
            cartResponse.setProductName(cart.getProduct().getName());
            cartResponse.setQuantity(cart.getQuantity());
            cartResponse.setImage(color.getImage());
            cartResponse.setPrice(String.valueOf(variant.getPrice()));
            cartResponse.setRam(variant.getRam());
            cartResponse.setRom(variant.getRom());
            cartResponse.setColorName(color.getColorName());

            cartResponses.add(cartResponse);
        }
        return ResponseEntity.ok(cartResponses);
    }

    public ResponseEntity<?> adRequestCart(CartRequest request) {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        Optional<ProductEntity> productOptional = productRepository.findById(request.getProductId());
        if (productOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm", 404));
        }

        if (request.getQuantity() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng phải lớn hơn 0", 400));
        }

        if (productOptional.get().getVariants() != null && !productOptional.get().getVariants().isEmpty()) {
            if (request.getVariantId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Thiếu thông tin biến thể", 400));
            }

            if (request.getPrice() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Thiếu thông tin giá sản phẩm", 400));
            }
        }

        if (productOptional.get().getColors() != null && !productOptional.get().getColors().isEmpty()) {
            if (request.getColorId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new StatusResponse("Thiếu thông tin màu sắc", 400));
            }
        }

        ProductEntity product = productOptional.get();
        if (request.getQuantity() > product.getStock()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng vượt quá hàng tồn kho", 400));
        }

        List<CartEntity> existingCartItems = cartRepository.findCartByUserId(user.getId());
        for (CartEntity cartItem : existingCartItems) {
            boolean sameProduct = cartItem.getProduct().getId().equals(request.getProductId());
            boolean sameVariant = (cartItem.getVariantId() == null && request.getVariantId() == null) ||
                    (cartItem.getVariantId() != null &&
                            request.getVariantId() != null &&
                            cartItem.getVariantId().equals(request.getVariantId()));
            boolean sameColor = (cartItem.getColorId() == null && request.getColorId() == null) ||
                    (cartItem.getColorId() != null &&
                            request.getColorId() != null &&
                            cartItem.getColorId().equals(request.getColorId()));

            if (sameProduct && sameVariant && sameColor) {
                int newQuantity = cartItem.getQuantity() + request.getQuantity();

                if (newQuantity > product.getStock()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new StatusResponse("Tổng số lượng vượt quá hàng tồn kho", 400));
                }

                cartItem.setQuantity(newQuantity);
                cartRepository.save(cartItem);
                return ResponseEntity.ok(new StatusResponse("Đã thêm sản phẩm vào giỏ hàng", 200));
            }
        }

        CartEntity newCartItem = new CartEntity();
        newCartItem.setUser(user);
        newCartItem.setProduct(productOptional.get());
        newCartItem.setQuantity(request.getQuantity());
        newCartItem.setColorId(request.getColorId());
        newCartItem.setVariantId(request.getVariantId());
        newCartItem.setPrice(request.getPrice());

        cartRepository.save(newCartItem);

        return ResponseEntity.ok(new StatusResponse("Đã thêm sản phẩm vào giỏ hàng", 200));
    }

    public ResponseEntity<?> removeFromCart(Long cartId) {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        Optional<CartEntity> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        CartEntity cart = cartOptional.get();
        if (!cart.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new StatusResponse("Bạn không có quyền xóa sản phẩm này", 403));
        }

        cartRepository.deleteById(cartId);
        return ResponseEntity.ok(new StatusResponse("Đã xóa sản phẩm khỏi giỏ hàng", 200));
    }

    public ResponseEntity<?> updateCartQuantity(CartRequest request) {
        ResponseEntity<?> response = getUser();
        if (!response.getStatusCode().is2xxSuccessful()) {
            return response;
        }
        UserEntity user = (UserEntity) response.getBody();
        Optional<CartEntity> cartOptional = cartRepository.findById(request.getProductId());
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        CartEntity cartItem = cartOptional.get();
        if (!cartItem.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new StatusResponse("Bạn không có quyền cập nhật giỏ hàng này", 403));
        }

        if (request.getQuantity() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng phải lớn hơn 0", 400));
        }

        ProductEntity product = cartItem.getProduct();
        if (request.getQuantity() > product.getStock()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng vượt quá hàng tồn kho", 400));
        }

        cartItem.setQuantity(request.getQuantity());
        cartRepository.save(cartItem);

        return ResponseEntity.ok(new StatusResponse("Cập nhật số lượng giỏ hàng thành công", 200));
    }
}
