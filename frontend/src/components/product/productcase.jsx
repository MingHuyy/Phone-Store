"use client"

import { useState, useEffect } from "react"
import "../../assets/css/productcase.css"

const ProductCase = ({ title, apiUrl }) => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
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
