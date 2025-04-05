import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaCreditCard } from "react-icons/fa";
import { getCart, updateCartQuantity, removeFromCart, removeMultipleFromCart } from "../../utils/CartService";
import "../../assets/css/cart.css";

const Cart = () => {
    // State cho giỏ hàng
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Lấy dữ liệu giỏ hàng
    const fetchCartData = async () => {
        setLoading(true);
        try {
            const data = await getCart();
            setCartItems(data);
            // Thiết lập mặc định tất cả đều được chọn
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
                    >
                        <FaCreditCard /> Thanh toán ({countSelectedItems()} sản phẩm)
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
