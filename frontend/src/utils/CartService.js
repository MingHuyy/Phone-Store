import { callApiWithAuth } from './AuthService';

// Lấy API_BASE_URL từ môi trường hoặc mặc định
const API_BASE_URL = "http://localhost:1111";

/**
 * Lấy danh sách sản phẩm trong giỏ hàng
 * @returns {Promise<Array>} Danh sách sản phẩm trong giỏ hàng
 */
export const getCart = async () => {
    // Kiểm tra token
    const token = localStorage.getItem("accessToken");
    if (!token) {
        // Nếu chưa đăng nhập, lấy từ localStorage
        return getLocalCart();
    }
    
    try {
        const response = await callApiWithAuth('/api/carts');
        return response;
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        throw error;
    }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {Number} productId ID của sản phẩm
 * @param {Number} quantity Số lượng sản phẩm
 * @param {Object} options Các tùy chọn bổ sung (màu sắc, cấu hình)
 * @returns {Promise<Object>} Kết quả thêm vào giỏ hàng
 */
export const adRequestCart = async (productId, quantity = 1, options = null) => {
    const token = localStorage.getItem("accessToken");
    
    try {
        // Tạo dữ liệu gửi lên server
        const cartData = {
            productId,
            quantity,
            ...(options && { 
                colorId: options.colorId,
                variantId: options.variantId,
                price: options.price
            })
        };
    
        
        const response = await fetch(`${API_BASE_URL}/api/carts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cartData)
        });
        
        // Xử lý response
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            result = { message: text, status: response.status };
        }
        
        if (!response.ok) {
            throw new Error(result.message || `Lỗi HTTP ${response.status}`);
        }
        
        // Cập nhật UI hiển thị giỏ hàng nếu cần
        if (window.refreshCartCount) {
            // Luôn gọi refresh để cập nhật chính xác số lượng
            window.refreshCartCount();
        }
        
        return result;
    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        throw error;
    }
};


/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * @param {Number} cartId ID của item trong giỏ hàng
 * @param {Number} quantity Số lượng mới
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateCartQuantity = async (cartId, quantity) => {
    // Kiểm tra token
    const token = localStorage.getItem("accessToken");
    if (!token) {
        // Nếu chưa đăng nhập, cập nhật trong localStorage
        return updateLocalCartQuantity(cartId, quantity);
    }
    
    try {
        const response = await callApiWithAuth(`/api/carts/${cartId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                productId: cartId,
                quantity 
            })
        });
        return response;
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng giỏ hàng:', error);
        throw error;
    }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * @param {Number} cartId ID của item trong giỏ hàng
 * @returns {Promise<Object>} Kết quả xóa
 */
export const removeFromCart = async (cartId) => {
    // Kiểm tra token
    const token = localStorage.getItem("accessToken");
    if (!token) {
        // Nếu chưa đăng nhập, xóa từ localStorage
        return removeFromLocalCart(cartId);
    }
    
    try {
        const response = await callApiWithAuth(`/api/carts/${cartId}`, {
            method: 'DELETE'
        });
        
        // Cập nhật số lượng trên header (nếu cần)
        if (window.updateCartCount) {
            window.updateCartCount(-1); // Giảm số lượng đi 1
        }
        
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
        throw error;
    }
};

/**
 * Xóa nhiều sản phẩm khỏi giỏ hàng
 * @param {Array<Number>} cartIds Danh sách ID cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
export const removeMultipleFromCart = async (cartIds) => {
    // Kiểm tra token
    const token = localStorage.getItem("accessToken");
    if (!token) {
        // Nếu chưa đăng nhập, xóa từ localStorage
        return removeMultipleFromLocalCart(cartIds);
    }
    
    try {
        const response = await callApiWithAuth('/api/carts/items', {
            method: 'DELETE',
            body: JSON.stringify(cartIds)
        });
        
        // Cập nhật số lượng trên header (nếu cần)
        if (window.updateCartCount) {
            window.updateCartCount(-cartIds.length); // Giảm số lượng
        }
        
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
        throw error;
    }
};

// Các hàm xử lý giỏ hàng trên localStorage cho người dùng chưa đăng nhập
const LOCAL_CART_KEY = 'localCart';

/**
 * Lấy giỏ hàng từ localStorage
 * @returns {Array} Giỏ hàng
 */
export const getLocalCart = () => {
    const cartData = localStorage.getItem(LOCAL_CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
};

/**
 * Thêm sản phẩm vào giỏ hàng localStorage
 * @param {Number} productId ID sản phẩm
 * @param {Number} quantity Số lượng
 * @returns {Array} Giỏ hàng đã cập nhật
 */
export const adRequestLocalCart = (productId, quantity = 1, productData = null) => {
    let cart = getLocalCart();
    
    // Tìm sản phẩm trong giỏ hàng
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        // Cập nhật số lượng nếu đã có
        existingItem.quantity += quantity;
    } else {
        // Thêm mới nếu chưa có
        cart.push({
            id: Date.now(), // ID tạm thời
            productId,
            quantity,
            ...productData // Thêm thông tin sản phẩm nếu có
        });
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    
    // Cập nhật số lượng trên header
    if (window.updateCartCount) {
        window.updateCartCount(quantity);
    }
    
    return cart;
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng localStorage
 * @param {Number} cartId ID giỏ hàng
 * @param {Number} quantity Số lượng mới
 * @returns {Array} Giỏ hàng đã cập nhật
 */
export const updateLocalCartQuantity = (cartId, quantity) => {
    let cart = getLocalCart();
    
    // Tìm và cập nhật
    cart = cart.map(item => 
        item.id === cartId ? { ...item, quantity } : item
    );
    
    // Lưu lại vào localStorage
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    
    return cart;
};

/**
 * Xóa sản phẩm khỏi giỏ hàng localStorage
 * @param {Number} cartId ID giỏ hàng
 * @returns {Array} Giỏ hàng đã cập nhật
 */
export const removeFromLocalCart = (cartId) => {
    let cart = getLocalCart();
    
    // Lọc bỏ sản phẩm cần xóa
    cart = cart.filter(item => item.id !== cartId);
    
    // Lưu lại vào localStorage
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    
    // Cập nhật số lượng trên header
    if (window.updateCartCount) {
        window.updateCartCount(-1);
    }
    
    return cart;
};

/**
 * Xóa nhiều sản phẩm khỏi giỏ hàng localStorage
 * @param {Array<Number>} cartIds Danh sách ID cần xóa
 * @returns {Array} Giỏ hàng đã cập nhật
 */
export const removeMultipleFromLocalCart = (cartIds) => {
    let cart = getLocalCart();
    
    // Lọc bỏ các sản phẩm cần xóa
    cart = cart.filter(item => !cartIds.includes(item.id));
    
    // Lưu lại vào localStorage
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    
    // Cập nhật số lượng trên header
    if (window.updateCartCount) {
        window.updateCartCount(-cartIds.length);
    }
    
    return cart;
}; 