import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaHome, FaListAlt } from "react-icons/fa";
import "../assets/css/paymentresult.css";
import { callApiWithAuth } from "../utils/AuthService";

const PaymentResult = () => {
    const [paymentStatus, setPaymentStatus] = useState({
        status: "loading",
        message: "",
        orderId: null
    });
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Hàm xóa sản phẩm khỏi giỏ hàng dựa trên đơn hàng
    const clearCartAfterPayment = async (orderId) => {
        try {
            // Lấy thông tin đơn hàng để biết sản phẩm nào đã được thanh toán
            const orderResponse = await callApiWithAuth(`/api/orders/${orderId}`);
            
            if (orderResponse) {
                // Lấy danh sách sản phẩm trong giỏ hàng
                const cartItems = await callApiWithAuth('/api/carts');
                
                if (Array.isArray(cartItems) && cartItems.length > 0) {
                    // Lọc ra các ID sản phẩm cần xóa từ giỏ hàng
                    const productIdsInOrder = orderResponse.orderItems.map(item => item.productId);
                    const cartItemsToRemove = cartItems
                        .filter(cartItem => productIdsInOrder.includes(cartItem.productId))
                        .map(item => item.id);
                    
                    if (cartItemsToRemove.length > 0) {
                        // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
                        await callApiWithAuth('/api/carts/items', {
                            method: 'DELETE',
                            body: JSON.stringify(cartItemsToRemove)
                        });
                        
                        // Cập nhật số lượng giỏ hàng trên header
                        if (window.refreshCartCount) {
                            window.refreshCartCount();
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        }
    };

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                // Lấy query parameters từ URL
                const queryParams = new URLSearchParams(location.search);
                
                // Kiểm tra response code từ VNPay
                const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
                const vnp_TxnRef = queryParams.get("vnp_TxnRef"); // Mã đơn hàng
                
                if (vnp_ResponseCode === "00") {
                    // Thanh toán thành công
                    setPaymentStatus({
                        status: "success",
                        message: "Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.",
                        orderId: vnp_TxnRef
                    });
                    
                    // Xóa sản phẩm đã thanh toán khỏi giỏ hàng
                    if (vnp_TxnRef) {
                        await clearCartAfterPayment(vnp_TxnRef);
                    }
                } else {
                    // Thanh toán thất bại
                    setPaymentStatus({
                        status: "error",
                        message: "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
                        orderId: vnp_TxnRef
                    });
                }
            } catch (error) {
                console.error("Lỗi khi xử lý kết quả thanh toán:", error);
                setPaymentStatus({
                    status: "error",
                    message: "Đã xảy ra lỗi khi xử lý kết quả thanh toán.",
                    orderId: null
                });
            } finally {
                setLoading(false);
            }
        };

        processPaymentResult();
    }, [location]);

    if (loading) {
        return (
            <div className="payment-result-container loading">
                <div className="loading-spinner"></div>
                <p>Đang xử lý kết quả thanh toán...</p>
            </div>
        );
    }

    return (
        <div className="payment-result-container">
            <div className="payment-result-card">
                <div className={`result-icon ${paymentStatus.status}`}>
                    {paymentStatus.status === "success" ? (
                        <FaCheckCircle />
                    ) : (
                        <FaTimesCircle />
                    )}
                </div>
                
                <h1 className={paymentStatus.status}>
                    {paymentStatus.status === "success" ? "Thanh toán thành công" : "Thanh toán thất bại"}
                </h1>
                
                <p className="result-message">{paymentStatus.message}</p>
                
                {paymentStatus.orderId && (
                    <p className="order-id">
                        Mã đơn hàng: <strong>#{paymentStatus.orderId}</strong>
                    </p>
                )}
                
                <div className="action-buttons">
                    <Link to="/" className="btn btn-home">
                        <FaHome /> Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult; 