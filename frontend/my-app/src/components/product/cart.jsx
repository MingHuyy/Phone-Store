import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaCreditCard } from "react-icons/fa";
import "../../assets/css/cart.css";

const Cart = () => {
    // State cho giỏ hàng
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy dữ liệu giỏ hàng
    useEffect(() => {
        // Giả lập API call
        setTimeout(() => {
            try {
                // Dữ liệu mẫu
                const sampleCartItems = [
                    {
                        id: 1,
                        name: "iPhone 13 Pro Max",
                        image: "/placeholder.svg?height=80&width=80",
                        price: 28990000,
                        quantity: 1,
                        color: "Xanh Sierra",
                        storage: "256GB"
                    },
                    {
                        id: 2,
                        name: "Samsung Galaxy S22 Ultra",
                        image: "/placeholder.svg?height=80&width=80",
                        price: 25990000,
                        quantity: 2,
                        color: "Đen",
                        storage: "128GB"
                    },
                    {
                        id: 3,
                        name: "Xiaomi Redmi Note 11",
                        image: "/placeholder.svg?height=80&width=80",
                        price: 4990000,
                        quantity: 1,
                        color: "Xám",
                        storage: "64GB"
                    }
                ];

                setCartItems(sampleCartItems);
                setLoading(false);
            } catch (err) {
                setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
                setLoading(false);
            }
        }, 1000);
    }, []);

    // Tăng số lượng sản phẩm
    const increaseQuantity = (id) => {
        setCartItems(
            cartItems.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Giảm số lượng sản phẩm
    const decreaseQuantity = (id) => {
        setCartItems(
            cartItems.map((item) =>
                item.id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeItem = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
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
                    <button className="primary-button" onClick={() => window.location.reload()}>
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
                        <div className="cart-table-header">
                            <div className="cart-column stt">STT</div>
                            <div className="cart-column product">Sản phẩm</div>
                            <div className="cart-column quantity">Số lượng</div>
                            <div className="cart-column price">Giá</div>
                            <div className="cart-column subtotal">Thành tiền</div>
                            <div className="cart-column actions">Xóa</div>
                        </div>

                        <div className="cart-table-body">
                            {cartItems.map((item, index) => (
                                <div className="cart-item" key={item.id}>
                                    <div className="cart-column stt">{index + 1}</div>

                                    <div className="cart-column product">
                                        <div className="product-info">
                                            <img src={item.image || "/placeholder.svg"} alt={item.name} className="product-image" />
                                            <div className="product-details">
                                                <h3 className="cart-product-name">{item.name}</h3>
                                                <div className="product-meta">
                                                    <span>Màu: {item.color}</span>
                                                    <span>Bộ nhớ: {item.storage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="cart-column quantity">
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

                                    <div className="cart-column price">
                                        {formatCurrency(item.price)}
                                    </div>

                                    <div className="cart-column subtotal">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>

                                    <div className="cart-column actions">
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

                    <button className="checkout-btn">
                        <FaCreditCard /> Thanh toán
                    </button>

                    <Link to="/" className="continue-shopping-link">
                        <FaArrowLeft /> Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
