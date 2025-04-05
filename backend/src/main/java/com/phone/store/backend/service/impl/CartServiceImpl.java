package com.phone.store.backend.service.impl;

import com.phone.store.backend.entity.CartEntity;
import com.phone.store.backend.entity.ProductEntity;
import com.phone.store.backend.entity.UserEntity;
import com.phone.store.backend.model.dto.CartDTO;
import com.phone.store.backend.model.response.CartResponse;
import com.phone.store.backend.model.response.StatusResponse;
import com.phone.store.backend.respository.CartRepository;
import com.phone.store.backend.respository.ProductRepository;
import com.phone.store.backend.respository.UserRepository;
import com.phone.store.backend.service.CartService;
import com.phone.store.backend.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TokenService tokenService;

    @Override
    public ResponseEntity<List<CartResponse>> getCart(String AccessToken) {
        Long userId = tokenService.getUserIdFromToken(AccessToken);
        List<CartEntity> cartItems = cartRepository.findCartByUserId(userId);
        List<CartResponse> cartResponses = new ArrayList<>();

        for (CartEntity cart : cartItems) {
            CartResponse cartResponse = new CartResponse();
            cartResponse.setId(cart.getId());
            cartResponse.setProductName(cart.getProduct().getName());
            cartResponse.setQuantity(cart.getQuantity());
            cartResponse.setImage(cart.getProduct().getImage());
            cartResponse.setPrice(String.valueOf(cart.getProduct().getPrice()));

            cartResponse.setRam(cart.getProduct().getProductDetail().getRam());
            cartResponse.setRom(cart.getProduct().getProductDetail().getRom());

            cartResponses.add(cartResponse);
        }
        return ResponseEntity.ok(cartResponses);
    }

    @Override
    public ResponseEntity<StatusResponse> addToCart(CartDTO request, Long userId) {
        Optional<UserEntity> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy thông tin người dùng", 404));
        }

        Optional<ProductEntity> productOptional = productRepository.findById(request.getProductId());
        if (productOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm", 404));
        }

        if (request.getQuantity() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng phải lớn hơn 0", 400));
        }

        ProductEntity product = productOptional.get();
        if (request.getQuantity() > product.getStock()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponse("Số lượng vượt quá hàng tồn kho", 400));
        }

        List<CartEntity> existingCartItems = cartRepository.findCartByUserId(userId);
        for (CartEntity cartItem : existingCartItems) {
            if (cartItem.getProduct().getId().equals(request.getProductId())) {
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
        newCartItem.setUser(userOptional.get());
        newCartItem.setProduct(productOptional.get());
        newCartItem.setQuantity(request.getQuantity());

        cartRepository.save(newCartItem);

        return ResponseEntity.ok(new StatusResponse("Đã thêm sản phẩm vào giỏ hàng", 200));
    }

    @Override
    public ResponseEntity<StatusResponse> removeFromCart(Long cartId) {
        Optional<CartEntity> cartOptional = cartRepository.findById(cartId);
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        cartRepository.deleteById(cartId);

        return ResponseEntity.ok(new StatusResponse("Đã xóa sản phẩm khỏi giỏ hàng", 200));
    }

    @Override
    public ResponseEntity<StatusResponse> updateCartQuantity(CartDTO request, Long userId) {
        Optional<CartEntity> cartOptional = cartRepository.findById(request.getProductId());
        if (cartOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new StatusResponse("Không tìm thấy sản phẩm trong giỏ hàng", 404));
        }

        CartEntity cartItem = cartOptional.get();
        if (!cartItem.getUser().getId().equals(userId)) {
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
