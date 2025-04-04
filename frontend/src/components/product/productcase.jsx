"use client"

import { useState, useEffect } from "react"
import { FaPlus } from "react-icons/fa"
import { IoCheckmarkCircle, IoAlertCircle } from "react-icons/io5"
import { addToCart } from "../../utils/CartService"
import "../../assets/css/productcase.css"

const ProductCase = ({ title, apiUrl }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationMessage, setNotificationMessage] = useState("")
    const [notificationType, setNotificationType] = useState("success")
    
    const handleAddToCart = async (product) => {
        try {
            if (!product.inStock) {
                setNotificationMessage("Sản phẩm đã hết hàng!")
                setNotificationType("error")
                setShowNotification(true)
                setTimeout(() => setShowNotification(false), 3000)
                return
            }
            
            await addToCart(product.id, 1)
            
            // Hiển thị thông báo thành công
            setNotificationMessage("Đã thêm sản phẩm vào giỏ hàng!")
            setNotificationType("success")
            setShowNotification(true)
            
            // Ẩn thông báo sau 3 giây
            setTimeout(() => setShowNotification(false), 3000)
            
        } catch (error) {
            // Hiển thị thông báo lỗi
            setNotificationMessage(error.message || "Không thể thêm vào giỏ hàng!")
            setNotificationType("error")
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
            console.error("Lỗi khi thêm vào giỏ hàng:", error)
        }
    }
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                const response = await fetch(apiUrl)
                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }
                const data = await response.json()
                
                // Thêm trường inStock dựa trên stock
                const productsWithStock = data.map(product => ({
                    ...product,
                    inStock: product.stock > 0
                }))
                
                setProducts(productsWithStock)
                setLoading(false)
            } catch (error) {
                setError("Không thể tải dữ liệu sản phẩm")
                setLoading(false)
                console.error("Error fetching products:", error)
            }
        }

        fetchProducts()
    }, [apiUrl])

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    if (loading) {
        return (
            <div className="product-showcase loading">
                <div className="showcase-title">{title}</div>
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="product-showcase error">
                <div className="showcase-title">{title}</div>
                <div className="error-message">{error}</div>
            </div>
        )
    }

    return (
        <div className="product-showcase">
            {showNotification && (
                <div className={`notification ${notificationType}`}>
                    {notificationType === "success" ? (
                        <IoCheckmarkCircle className="notification-icon" />
                    ) : (
                        <IoAlertCircle className="notification-icon" />
                    )}
                    <span>{notificationMessage}</span>
                </div>
            )}
            
            <div className="showcase-title">* {title} *</div>
            <div className="product-grid">
                {products.slice(0, 5).map((product, index) => (
                    <div key={product.id || index} className="product-card">
                        {!product.inStock && (
                            <div className="out-of-stock-overlay">Hết hàng</div>
                        )}
                        
                        <a href={`/product/${product.id}`} className="product-link">
                            <div className="product-images">
                                {product.image ? (
                                    <img
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = "/placeholder.svg"
                                        }}
                                    />
                                ) : (
                                    <img src="/placeholder.svg" alt="Placeholder" />
                                )}
                            </div>
                            <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-price">
                                    <span className="current-price">{formatPrice(product.price)}đ</span>
                                </div>
                            </div>
                        </a>
                        {/* Nút thêm vào giỏ hàng */}
                        <button 
                            className={`add-to-cart ${!product.inStock ? 'disabled' : ''}`}
                            disabled={!product.inStock}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                            }}
                        >
                            <FaPlus />
                        </button>
                    </div>
                ))}
            </div>
            <div className="view-all">
                <a href={`/products`}>
                    Xem tất cả {products.length} sản phẩm
                </a>
            </div>
        </div>
    )
}

export default ProductCase
