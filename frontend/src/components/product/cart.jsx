import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaCcVisa, FaUserAlt, FaPhone, FaMapMarkerAlt, FaCheck } from "react-icons/fa";
import { getCart, updateCartQuantity, removeFromCart, removeMultipleFromCart } from "../../utils/CartService";
import "../../assets/css/cart.css";

const Cart = () => {
    // State cho giỏ hàng
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    // State cho form thanh toán
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutInfo, setCheckoutInfo] = useState({
        fullName: "",
        phone: "",
        address: "",
        paymentMethod: "cod", // mặc định là COD
    });
    const [formErrors, setFormErrors] = useState({});

    // Lấy dữ liệu giỏ hàng
    const fetchCartData = async () => {
        setLoading(true);
        try {
            const data = await getCart();
            setCartItems(data);
            const initialSelected = {};
            data.forEach(item => {
                initialSelected[item.id] = true;
            });
            setSelectedItems(initialSelected);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy giỏ hàng:", error);
            setError("Không thể tải thông tin giỏ hàng.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    // Xử lý chọn/bỏ chọn sản phẩm
    const handleSelectItem = (id) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Xử lý chọn/bỏ chọn tất cả
    const handleSelectAll = (isSelected) => {
        const newSelectedItems = {};
        cartItems.forEach(item => {
            newSelectedItems[item.id] = isSelected;
        });
        setSelectedItems(newSelectedItems);
    };

    // Tăng số lượng sản phẩm
    const increaseQuantity = async (itemId) => {
        const item = cartItems.find((item) => item.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + 1;

        try {
            await updateCartQuantity(itemId, newQuantity);

            // Cập nhật state
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (error) {
            console.error("Lỗi khi tăng số lượng:", error);
        }
    };

    // Giảm số lượng sản phẩm
    const decreaseQuantity = async (itemId) => {
        const item = cartItems.find((item) => item.id === itemId);
        if (!item || item.quantity <= 1) return;

        const newQuantity = item.quantity - 1;

        try {
            await updateCartQuantity(itemId, newQuantity);

            // Cập nhật state
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (error) {
            console.error("Lỗi khi giảm số lượng:", error);
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeItem = async (itemId) => {
        try {
            await removeFromCart(itemId);

            // Cập nhật state
            setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
    };

    // Xóa nhiều sản phẩm đã chọn
    const removeSelectedItems = async () => {
        // Lấy danh sách ID sản phẩm đã chọn
        const itemsToRemove = Object.entries(selectedItems)
            .filter(([_, isSelected]) => isSelected) // eslint-disable-line no-unused-vars
            .map(([id]) => Number(id));

        if (itemsToRemove.length === 0) {
            alert("Vui lòng chọn sản phẩm để xóa");
            return;
        }

        // Xác nhận xóa
        if (!window.confirm(`Bạn có chắc muốn xóa ${itemsToRemove.length} sản phẩm đã chọn?`)) {
            return;
        }

        setIsProcessing(true);

        try {
            await removeMultipleFromCart(itemsToRemove);

            // Cập nhật state
            setCartItems(prevItems => prevItems.filter(item => !itemsToRemove.includes(item.id)));

            // Cập nhật selected state
            const newSelectedItems = { ...selectedItems };
            itemsToRemove.forEach(id => {
                delete newSelectedItems[id];
            });
            setSelectedItems(newSelectedItems);
        } catch (error) {
            console.error("Lỗi khi xóa nhiều sản phẩm:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Tính tổng tiền của các sản phẩm đã chọn
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => selectedItems[item.id] ? total + parseInt(item.price) * item.quantity : total,
            0
        );
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(amount);
    };

    // Đếm số lượng sản phẩm đã chọn
    const countSelectedItems = () => {
        return Object.values(selectedItems).filter(Boolean).length;
    };

    // Xử lý hiển thị form thanh toán
    const handleShowCheckout = () => {
        if (countSelectedItems() === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
            return;
        }
        setShowCheckout(true);
    };

    // Xử lý đóng form thanh toán
    const handleCloseCheckout = () => {
        setShowCheckout(false);
    };

    // Xử lý thay đổi thông tin form thanh toán
    const handleCheckoutInfoChange = (e) => {
        const { name, value } = e.target;
        setCheckoutInfo({
            ...checkoutInfo,
            [name]: value
        });

        // Xóa lỗi khi người dùng nhập
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ""
            });
        }
    };

    // Xử lý thanh toán online
    const handleOnlinePayment = async (orderData) => {
        try {
            // Gọi API để tạo URL thanh toán VNPay
            const paymentResponse = await fetch('http://localhost:1111/api/payment/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(orderData)
            });
            
            console.log("Payment API response status:", paymentResponse.status);
            const paymentData = await paymentResponse.json();
            console.log("Payment API response data:", paymentData);
            
            if (paymentResponse.ok && paymentData.paymentUrl) {
                // Chuyển hướng đến trang thanh toán VNPay
                window.location.href = paymentData.paymentUrl;
                return true;
            } else {
                throw new Error(paymentData.message || "Không thể tạo liên kết thanh toán");
            }
        } catch (err) {
            console.error("Lỗi khi tạo URL thanh toán:", err);
            alert("Đặt hàng thành công nhưng không thể chuyển đến trang thanh toán. Vui lòng kiểm tra đơn hàng của bạn.");
            return false;
        }
    };

    // Xử lý xác nhận thanh toán
    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        
        // Kiểm tra dữ liệu
        const errors = {};
        if (!checkoutInfo.fullName.trim()) {
            errors.fullName = "Vui lòng nhập họ tên người nhận";
        }
        
        if (!checkoutInfo.phone.trim()) {
            errors.phone = "Vui lòng nhập số điện thoại";
        } else if (!/^[0-9]{10}$/.test(checkoutInfo.phone)) {
            errors.phone = "Số điện thoại phải có 10 chữ số";
        }
        
        if (!checkoutInfo.address.trim()) {
            errors.address = "Vui lòng nhập địa chỉ nhận hàng";
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        
        // Lấy danh sách sản phẩm đã chọn
        const selectedProducts = cartItems.filter(item => selectedItems[item.id]);
        
        try {
            setIsProcessing(true);
            
            const orderData = {
                fullName: checkoutInfo.fullName,
                phone: checkoutInfo.phone,
                address: checkoutInfo.address,
                paymentMethod: checkoutInfo.paymentMethod,
                totalAmount: calculateTotal(),
                orderItems: selectedProducts.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: parseInt(item.price)
                }))
            }; 
            console.log("OrderData:", orderData);
            if (checkoutInfo.paymentMethod === "online") {
                const paymentSuccess = await handleOnlinePayment(orderData);
                if (paymentSuccess) return;
            } else {
                const response = await fetch('http://localhost:1111/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                const data = await response.json();

                console.log("OrderData response:", data);
                if (!response.ok) {
                    throw new Error(data.message || 'Đặt hàng thất bại');
                }
                
                const itemsToRemove = selectedProducts.map(item => item.id);
                await removeMultipleFromCart(itemsToRemove);
                
                // Cập nhật state
                setCartItems(prevItems => prevItems.filter(item => !selectedItems[item.id]));
                
                const newSelectedItems = {};
                cartItems.forEach(item => {
                    if (!selectedItems[item.id]) {
                        newSelectedItems[item.id] = true;
                    }
                });
                setSelectedItems(newSelectedItems);
                alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
            }
            setShowCheckout(false);
            
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert(error.message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-container">
                <div className="error-message">
                    <h3>Đã xảy ra lỗi</h3>
                    <p>{error}</p>
                    <button className="primary-button" onClick={fetchCartData}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="empty-cart">
                    <div className="empty-cart-icon">
                        <FaShoppingCart />
                    </div>
                    <h2>Giỏ hàng trống</h2>
                    <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                    <Link to="/" className="continue-shopping">
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1>
                    <FaShoppingCart className="cart-title-icon" /> Giỏ hàng của bạn
                </h1>
                <p>{cartItems.length} sản phẩm</p>
            </div>

            <div className="cart-content">
                <div className="cart-items">
                    <div className="cart-table">
                        <div className="cart-actions-header" style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
                            <div className="select-all-container" style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: '18px', height: '18px', accentColor: '#4e54c8', cursor: 'pointer', marginRight: '10px' }}
                                    checked={Object.values(selectedItems).every(Boolean) && cartItems.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                                <span>Chọn tất cả ({cartItems.length} sản phẩm)</span>
                            </div>

                            <button
                                className="delete-selected-btn"
                                onClick={removeSelectedItems}
                                disabled={countSelectedItems() === 0 || isProcessing}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: countSelectedItems() === 0 ? '#999' : '#ff3b30',
                                    cursor: countSelectedItems() === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontWeight: '500'
                                }}
                            >
                                <FaTrash /> Xóa đã chọn ({countSelectedItems()})
                            </button>
                        </div>

                        <div className="cart-table-body">
                            {cartItems.map((item) => (
                                <div className="cart-item" key={item.id}>
                                    <div className="cart-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems[item.id] || false}
                                            onChange={() => handleSelectItem(item.id)}
                                        />
                                    </div>

                                    <div className="cart-column product">
                                        <div className="cart-product-info">
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.productName}
                                                className="cart-product-image"
                                            />
                                            <div className="product-details">
                                                <h3 className="cart-product-name">{item.productName}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cart-actions-container">
                                        <div className="cart-quantity-price-group">
                                            <div className="cart-quantity-area">
                                                <div className="quantity-control">
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                        disabled={item.quantity <= 1}
                                                        aria-label="Giảm số lượng"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={item.quantity}
                                                        readOnly
                                                        className="quantity-input"
                                                        aria-label="Số lượng"
                                                    />
                                                    <button
                                                        className="quantity-btn"
                                                        onClick={() => increaseQuantity(item.id)}
                                                        aria-label="Tăng số lượng"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="cart-price-area">
                                                <div className="cart-current-price">
                                                    {formatCurrency(parseInt(item.price))}
                                                </div>
                                                <div className="original-price">
                                                    {formatCurrency(parseInt(item.price) * 1.2)}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() => removeItem(item.id)}
                                            aria-label="Xóa sản phẩm"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cart-summary">
                    <h2>Tổng giỏ hàng</h2>

                    <div className="summary-row">
                        <span>Tạm tính:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                    </div>

                    <div className="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span>Miễn phí</span>
                    </div>

                    <div className="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                    </div>

                    <button
                        className="checkout-btn"
                        disabled={countSelectedItems() === 0}
                        style={{ opacity: countSelectedItems() === 0 ? 0.7 : 1 }}
                        onClick={handleShowCheckout}
                    >
                        <FaCreditCard /> Thanh toán ({countSelectedItems()} sản phẩm)
                    </button>

                    <Link to="/" className="continue-shopping-link">
                        <FaArrowLeft /> Tiếp tục mua sắm
                    </Link>
                </div>
            </div>

            {/* Form Thanh toán */}
            {showCheckout && (
                <div className="checkout-overlay">
                    <div className="checkout-modal">
                        <div className="checkout-header">
                            <h2>Thông tin thanh toán</h2>
                            <button className="close-btn" onClick={handleCloseCheckout}>&times;</button>
                        </div>

                        <div className="checkout-body">
                            <div className="checkout-summary">
                                <h3>Tóm tắt đơn hàng</h3>
                                <div className="checkout-products">
                                    {cartItems.filter(item => selectedItems[item.id]).map(item => (
                                        <div className="checkout-product-item" key={item.id}>
                                            <div className="checkout-product-info">
                                                <img src={item.image || "/placeholder.svg"} alt={item.productName} />
                                                <div>
                                                    <p className="checkout-product-name">{item.productName}</p>
                                                    <p className="checkout-product-quantity">Số lượng: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="checkout-product-price">
                                                {formatCurrency(parseInt(item.price) * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-total">
                                    <div className="summary-row">
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Phí vận chuyển:</span>
                                        <span>Miễn phí</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Tổng cộng:</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitOrder} className="checkout-form">
                                <h3>Thông tin nhận hàng</h3>

                                <div className="form-group">
                                    <label>
                                        <FaUserAlt /> Họ tên người nhận:
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={checkoutInfo.fullName}
                                        onChange={handleCheckoutInfoChange}
                                        placeholder="Nhập họ tên người nhận"
                                        className={formErrors.fullName ? "error" : ""}
                                    />
                                    {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FaPhone /> Số điện thoại:
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={checkoutInfo.phone}
                                        onChange={handleCheckoutInfoChange}
                                        placeholder="Nhập số điện thoại"
                                        className={formErrors.phone ? "error" : ""}
                                    />
                                    {formErrors.phone && <p className="error-message">{formErrors.phone}</p>}
                                </div>

                                <div className="form-group">
                                    <label>
                                        <FaMapMarkerAlt /> Địa chỉ nhận hàng:
                                    </label>
                                    <textarea
                                        name="address"
                                        value={checkoutInfo.address}
                                        onChange={handleCheckoutInfoChange}
                                        placeholder="Nhập địa chỉ nhận hàng"
                                        className={formErrors.address ? "error" : ""}
                                    ></textarea>
                                    {formErrors.address && <p className="error-message">{formErrors.address}</p>}
                                </div>

                                <div className="form-group payment-methods">
                                    <label>Phương thức thanh toán:</label>

                                    <div className="payment-option">
                                        <input
                                            type="radio"
                                            id="cod"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={checkoutInfo.paymentMethod === "cod"}
                                            onChange={handleCheckoutInfoChange}
                                        />
                                        <label htmlFor="cod">
                                            <FaMoneyBillWave className="payment-icon" />
                                            <div>
                                                <p className="payment-title">Thanh toán khi nhận hàng (COD)</p>
                                                <p className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="payment-option">
                                        <input
                                            type="radio"
                                            id="online"
                                            name="paymentMethod"
                                            value="online"
                                            checked={checkoutInfo.paymentMethod === "online"}
                                            onChange={handleCheckoutInfoChange}
                                        />
                                        <label htmlFor="online">
                                            <FaCcVisa className="payment-icon" />
                                            <div>
                                                <p className="payment-title">Thanh toán trực tuyến</p>
                                                <p className="payment-desc">Thanh toán bằng thẻ tín dụng/ghi nợ hoặc ví điện tử</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="checkout-actions">
                                    <button type="button" className="cancel-btn" onClick={handleCloseCheckout}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="confirm-btn">
                                        <FaCheck /> Xác nhận đặt hàng
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
