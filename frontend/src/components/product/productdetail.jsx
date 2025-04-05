"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaShoppingCart, FaHeart, FaShare, FaCheck, FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa"
import "../../assets/css/productdetail.css"
import { callApiWithAuth } from "../../utils/AuthService"
import { addToCart } from "../../utils/CartService"

const ProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [isShaking, setIsShaking] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("success")

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        const data = await callApiWithAuth(`/products/${productId}`)
        
        if (data && data.description) {
          const formattedDescription = data.description.replace(/([.!?])\s+/g, "$1\n");
          data.description = formattedDescription;
        }
        
        if (data) {
          setProduct(data)
        } else {
          setError("Không tìm thấy thông tin sản phẩm")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error fetching product details:", error)
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [productId])

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (product?.stock <= 0) {
      setShowNotification(true);
      setNotificationMessage('Sản phẩm đã hết hàng!');
      setNotificationType('error');
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return;
    }
    
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    
    try {
      const response = await addToCart(Number(productId), quantity);
      
      let message = '';
      if (typeof response === 'object' && response.message) {
        message = response.message;
      } else if (typeof response === 'string') {
        message = response;
      } else {
        message = `Đã thêm ${quantity} ${product.name} vào giỏ hàng!`;
      }
      
      setShowNotification(true);
      setNotificationMessage(message);
      setNotificationType('success');
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      
      setShowNotification(true);
      setNotificationMessage(error.message || 'Không thể thêm sản phẩm vào giỏ hàng!');
      setNotificationType('error');
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫"
  }

  if (loading) {
    return (
      <div className="product-detail-container loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-detail-container error">
        <div className="error-message">
          <span>!</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-container error">
        <div className="error-message">
          <span>!</span>
          <p>Không tìm thấy sản phẩm</p>
          <button onClick={() => navigate("/products")}>Quay lại danh sách sản phẩm</button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail-container">
      <div className="product-detail-breadcrumb">
        <button className="back-button" onClick={() => navigate("/products")}>
          <FaArrowLeft /> Quay lại
        </button>
        <div className="breadcrumb-trail">
          <a href="/">Trang chủ</a> / <a href="/products">Sản phẩm</a> / <span>{product.name}</span>
        </div>
      </div>

      <div className="product-detail-content">
        <div className="product-detail-left">
          <div className="product-main-image">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="main-image" />
          </div>
        </div>

        <div className="product-detail-right">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-stock">
            <span className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
              {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          <div className="productdetail-price">
            <span className="current-price">{formatPrice(product.price)}</span>
          </div>

          <div className="product-short-description">
            {product.description.length > 350 
              ? product.description.substring(0, 350).split(' ').slice(0, -1).join(' ') + '...' 
              : product.description}
          </div>

          <div className="product-actions">
            <div className="quantity-selector-container">
              <div className="quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1 || product?.stock <= 0} 
                  aria-label="Giảm số lượng"
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value)
                    if (!isNaN(val) && val >= 1 && val <= (product?.stock || 0)) {
                      setQuantity(val)
                    }
                  }}
                  min="1"
                  max={product?.stock || 0}
                  disabled={product?.stock <= 0}
                  aria-label="Số lượng"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product?.stock || product?.stock <= 0}
                  aria-label="Tăng số lượng"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            <div className="action-button">
              <button 
                className={`add-to-cart-btn ${isShaking ? 'shaking' : ''} ${product?.stock <= 0 ? 'disabled' : ''}`} 
                onClick={handleAddToCart}
                style={product?.stock <= 0 ? {cursor: 'not-allowed'} : {}}
              >
                <FaShoppingCart /> <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>

          <div className="product-benefits">
            <div className="benefit-item">
              <FaCheck /> Hàng chính hãng - Bảo hành 12 tháng
            </div>
            <div className="benefit-item">
              <FaCheck /> Giao hàng miễn phí toàn quốc
            </div>
            <div className="benefit-item">
              <FaCheck /> Đổi trả trong 7 ngày nếu lỗi do nhà sản xuất
            </div>
          </div>
        </div>
      </div>

      <div className="product-detail-tabs">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "description" ? "active" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`tab-button ${activeTab === "specifications" ? "active" : ""}`}
            onClick={() => setActiveTab("specifications")}
          >
            Thông số kỹ thuật
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "description" && (
            <div className="tab-pane description-pane">
              {product.description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="tab-pane specifications-pane">
              <div className="specifications-table">
                <div className="spec-row">
                  <div className="spec-name">Màn hình</div>
                  <div className="spec-value">{product.screen}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Hệ điều hành</div>
                  <div className="spec-value">{product.os}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Camera sau</div>
                  <div className="spec-value">{product.camera}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Camera trước</div>
                  <div className="spec-value">{product.cameraFront}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Chip</div>
                  <div className="spec-value">{product.cpu}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">RAM</div>
                  <div className="spec-value">{product.ram}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Bộ nhớ trong</div>
                  <div className="spec-value">{product.rom}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Pin, Sạc</div>
                  <div className="spec-value">{product.battery}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showNotification && (
        <div className={`notification ${notificationType}`}>
          {notificationType === 'success' && (
            <span className="notification-icon" style={{ marginRight: '10px' }}>✓</span>
          )}
          {notificationType === 'error' && (
            <span className="notification-icon" style={{ marginRight: '10px' }}>✗</span>
          )}
          <span>{notificationMessage}</span>
        </div>
      )}
    </div>
  )
}

export default ProductDetail

