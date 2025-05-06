"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
    FaArrowLeft,
    FaBox,
    FaCalendarAlt,
    FaCreditCard,
    FaMoneyBillWave,
    FaTruck,
    FaUser,
    FaMapMarkerAlt,
    FaPhone,
} from "react-icons/fa"
import "../assets/css/orderdetail.css"
import { callApiWithAuth } from "../utils/AuthService"

const OrderDetail = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await callApiWithAuth("/api/orders", {
                    method: "GET",
                });
                setOrders(response);
            } catch (error) {
                console.error("Lỗi khi lấy đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫"
    }

    const formatDate = (dateString) => {
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
        return new Date(dateString).toLocaleDateString("vi-VN", options)
    }

    const getPaymentStatusLabel = (status) => {
        switch (status) {
            case "COD":
                return "Thanh toán khi nhận hàng"
            case "COMPLETED":
                return "Đã thanh toán"
            default:
                return status
        }
    }

    const getPaymentStatusIcon = (status) => {
        switch (status) {
            case "COD":
                return <FaMoneyBillWave className="payment-icon cod" />
            case "COMPLETED":
                return <FaCreditCard className="payment-icon completed" />
            default:
                return <FaCreditCard className="payment-icon" />
        }
    }

    if (loading) {
        return (
            <div className="order-detail-container loading">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        )
    }

    // Hiển thị khi không có đơn hàng nào
    if (orders.length === 0) {
        return (
            <div className="order-detail-container">
                <Link to="/" className="back-button">
                    <FaArrowLeft /> Quay lại Trang chủ
                </Link>
                
                <div className="empty-order-container">
                    <div className="empty-order-icon">
                        <FaBox size={60} />
                    </div>
                    <h2>Bạn chưa có đơn hàng nào</h2>
                    <p>Hãy khám phá các sản phẩm của chúng tôi và đặt hàng ngay!</p>
                    <Link to="/products" className="explore-products-btn">
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="order-detail-container">
            <Link to="/" className="back-button">
                            <FaArrowLeft /> Quay lại Trang chủ
                        </Link>
            {orders.map((order, index) => (
                <div key={order.id} className="order-card">
                    <div className="order-detail-header">
                        <h1>Chi tiết đơn hàng #{index + 1}</h1>
                        <div className="order-status">
                            <FaTruck className="status-icon processing" />
                            <span>Đang vận chuyển</span>
                        </div>
                    </div>

                    <div className="order-detail-content">
                        <div className="order-info-section">
                            <div className="order-info-card">
                                <div className="card-header">
                                    <h2>Thông tin đơn hàng</h2>
                                </div>
                                <div className="card-content">
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaBox /> Mã đơn hàng:
                                        </div>
                                        <div className="info-value">#{order.id}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaCalendarAlt /> Ngày đặt hàng:
                                        </div>
                                        <div className="info-value">{formatDate(order.createdAt)}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaCreditCard /> Phương thức thanh toán:
                                        </div>
                                        <div className="info-value payment-status">
                                            {getPaymentStatusIcon(order.paymentStatus)}
                                            <span>{getPaymentStatusLabel(order.paymentStatus)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-info-card">
                                <div className="card-header">
                                    <h2>Thông tin khách hàng</h2>
                                </div>
                                <div className="card-content">
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaUser /> Họ tên:
                                        </div>
                                        <div className="info-value">{order.fullName}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaPhone /> Số điện thoại:
                                        </div>
                                        <div className="info-value">{order.phone}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">
                                            <FaMapMarkerAlt /> Địa chỉ giao hàng:
                                        </div>
                                        <div className="info-value address">{order.address}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-items-section">
                            <div className="order-items-card">
                                <div className="card-header">
                                    <h2>Sản phẩm đã đặt</h2>
                                </div>
                                <div className="card-content">
                                    <div className="order-items-table">
                                        <div className="table-header">
                                            <div className="col product-col">Sản phẩm</div>
                                            <div className="col price-col">Đơn giá</div>
                                            <div className="col quantity-col">Số lượng</div>
                                            <div className="col total-col">Thành tiền</div>
                                        </div>
                                        <div className="table-body">
                                            {order.orderItems.map((item) => (
                                                <div key={item.id} className="table-row">
                                                    <div className="col product-col">
                                                        <div className="orderdetail-product-info">
                                                            <div className="orderdetail-product-image">
                                                                <img
                                                                    src={item.productImage}
                                                                    alt={item.productName}
                                                                />
                                                            </div>
                                                            <div className="orderdetail-product-details">
                                                                <div className="orderdetail-product-name">{item.productName}</div>
                                                                {item.color && (
                                                                    <div className="orderdetail-product-color">
                                                                        <span className="color-label">Màu sắc:</span> {item.color}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col price-col">{formatPrice(item.price)}</div>
                                                    <div className="col quantity-col">{item.quantity}</div>
                                                    <div className="col total-col">{formatPrice(item.price * item.quantity)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-row total">
                                            <div className="summary-label">Tổng cộng:</div>
                                            <div className="summary-value">{formatPrice(order.totalPrice)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default OrderDetail
