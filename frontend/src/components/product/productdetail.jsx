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
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [currentImage, setCurrentImage] = useState("")
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true)
        const data = await callApiWithAuth(`/products/${productId}`)
        console.log(data)
        
        if (data && data.description) {
          const formattedDescription = data.description.replace(/([.!?])\s+/g, "$1\n");
          data.description = formattedDescription;
        }
        
        if (data) {
          setProduct(data)
          
          // Khởi tạo các giá trị mặc định ban đầu
          let defaultConfig = null;
          let defaultColor = null;
          let defaultVariant = null;
          let defaultPrice = data.price;
          let defaultImage = data.image;
          
          // Xác định cấu hình mặc định (lấy cấu hình đầu tiên)
          if (data.variants && data.variants.length > 0) {
            const configs = [...new Set(data.variants.map(v => `${v.ram}/${v.rom}`))];
            if (configs.length > 0) {
              defaultConfig = configs[0];
            }
          }
          
          // Xác định màu mặc định (lấy màu đầu tiên)
          if (data.colors && data.colors.length > 0) {
            defaultColor = data.colors[0].colorName;
            if (data.colors[0].image) {
              defaultImage = data.colors[0].image;
            }
          } else if (data.variants && data.variants.length > 0) {
            const colors = [...new Set(data.variants.map(v => v.color))];
            if (colors.length > 0) {
              defaultColor = colors[0];
            }
          }
          
          // Tìm biến thể phù hợp với màu và cấu hình mặc định
          if (data.variants && data.variants.length > 0 && defaultColor && defaultConfig) {
            const [ram, rom] = defaultConfig.split('/');
            defaultVariant = data.variants.find(v => 
              v.color === defaultColor && v.ram === ram && v.rom === rom
            );
            
            // Nếu không tìm thấy biến thể phù hợp với cả màu và cấu hình, ưu tiên cấu hình
            if (!defaultVariant) {
              defaultVariant = data.variants.find(v => v.ram === ram && v.rom === rom);
              if (defaultVariant) {
                defaultColor = defaultVariant.color;
              }
            }
            
            // Nếu vẫn không tìm thấy, chọn biến thể đầu tiên
            if (!defaultVariant) {
              defaultVariant = data.variants[0];
              defaultConfig = `${defaultVariant.ram}/${defaultVariant.rom}`;
              defaultColor = defaultVariant.color;
            }
            
            // Cập nhật giá từ biến thể đã chọn
            if (defaultVariant) {
              defaultPrice = defaultVariant.price;
            }
            
            // Tìm ảnh tương ứng với màu đã chọn
            if (data.colors && data.colors.length > 0 && defaultColor) {
              const colorObj = data.colors.find(c => c.colorName === defaultColor);
              if (colorObj && colorObj.image) {
                defaultImage = colorObj.image;
              }
            }
          }
          
          // Thiết lập các giá trị mặc định
          setCurrentImage(defaultImage);
          setCurrentPrice(defaultPrice);
          setSelectedConfig(defaultConfig);
          setSelectedColor(defaultColor);
          setSelectedVariant(defaultVariant);
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

  const handleColorSelect = (color, image) => {
    setSelectedColor(color);
    
    // Cập nhật hình ảnh nếu có
    if (image) {
      setCurrentImage(image);
    }
    
    // Tìm tất cả biến thể có màu này
    if (product.variants && product.variants.length > 0) {
      const variantsWithThisColor = product.variants.filter(v => v.color === color);
      
      if (variantsWithThisColor.length > 0) {
        // Nếu đã có cấu hình được chọn, tìm biến thể phù hợp với cả màu và cấu hình
        if (selectedConfig) {
          const [ram, rom] = selectedConfig.split('/');
          const matchingVariant = variantsWithThisColor.find(v => 
            v.ram === ram && v.rom === rom
          );
          
          if (matchingVariant) {
            setSelectedVariant(matchingVariant);
            setCurrentPrice(matchingVariant.price);
          } else {
            // Nếu không tìm thấy biến thể phù hợp với cấu hình hiện tại, chọn biến thể đầu tiên của màu này
            setSelectedVariant(variantsWithThisColor[0]);
            setSelectedConfig(`${variantsWithThisColor[0].ram}/${variantsWithThisColor[0].rom}`);
            setCurrentPrice(variantsWithThisColor[0].price);
          }
        } else {
          // Nếu chưa có cấu hình được chọn, chọn biến thể đầu tiên của màu này
          setSelectedVariant(variantsWithThisColor[0]);
          setSelectedConfig(`${variantsWithThisColor[0].ram}/${variantsWithThisColor[0].rom}`);
          setCurrentPrice(variantsWithThisColor[0].price);
        }
      }
    }
  }

  // Xử lý khi người dùng chọn một thumbnail ảnh
  const handleThumbnailClick = (image, colorName) => {
    setCurrentImage(image);
    
    // Nếu có màu được cung cấp, đồng bộ với lựa chọn màu
    if (colorName) {
      setSelectedColor(colorName);
      
      // Đồng bộ với biến thể và cấu hình
      if (product.variants && product.variants.length > 0) {
        const variantsWithThisColor = product.variants.filter(v => v.color === colorName);
        
        if (variantsWithThisColor.length > 0) {
          // Nếu đã có cấu hình được chọn, tìm biến thể phù hợp với cả màu và cấu hình
          if (selectedConfig) {
            const [ram, rom] = selectedConfig.split('/');
            const matchingVariant = variantsWithThisColor.find(v => 
              v.ram === ram && v.rom === rom
            );
            
            if (matchingVariant) {
              setSelectedVariant(matchingVariant);
              setCurrentPrice(matchingVariant.price);
            } else {
              // Nếu không tìm thấy biến thể phù hợp, chọn biến thể đầu tiên của màu đó
              setSelectedVariant(variantsWithThisColor[0]);
              setSelectedConfig(`${variantsWithThisColor[0].ram}/${variantsWithThisColor[0].rom}`);
              setCurrentPrice(variantsWithThisColor[0].price);
            }
          } else {
            // Nếu chưa có cấu hình được chọn, chọn biến thể đầu tiên của màu đó
            setSelectedVariant(variantsWithThisColor[0]);
            setSelectedConfig(`${variantsWithThisColor[0].ram}/${variantsWithThisColor[0].rom}`);
            setCurrentPrice(variantsWithThisColor[0].price);
          }
        }
      }
    }
  }

  const handleConfigSelect = (config) => {
    setSelectedConfig(config);
    
    // Cập nhật giá dựa trên cấu hình đã chọn
    if (product.variants && product.variants.length > 0) {
      const [ram, rom] = config.split('/');
      const variantsWithThisConfig = product.variants.filter(v => 
        v.ram === ram && v.rom === rom
      );
      
      if (variantsWithThisConfig.length > 0) {
        // Cập nhật giá dựa trên cấu hình đã chọn, không thay đổi màu sắc
        const firstVariant = variantsWithThisConfig[0];
        setCurrentPrice(firstVariant.price);
        
        // Nếu đã có màu được chọn, giữ nguyên màu đó
        // Nếu chưa có màu được chọn, thiết lập màu đầu tiên từ cấu hình mới
        if (!selectedColor) {
          setSelectedColor(firstVariant.color);
          
          // Tìm hình ảnh tương ứng từ danh sách colors
          if (product.colors) {
            const matchingColor = product.colors.find(c => c.colorName === firstVariant.color);
            if (matchingColor && matchingColor.image) {
              setCurrentImage(matchingColor.image);
            }
          }
        }
        
        // Cập nhật selectedVariant nếu có màu được chọn
        if (selectedColor) {
          const matchingVariant = variantsWithThisConfig.find(v => v.color === selectedColor);
          if (matchingVariant) {
            setSelectedVariant(matchingVariant);
          } else {
            // Nếu không tìm thấy variant với màu đã chọn, vẫn giữ màu nhưng cập nhật variant
            setSelectedVariant(firstVariant);
          }
        } else {
          setSelectedVariant(firstVariant);
        }
      }
    }
  }

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
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return;
    }
    
    // Kiểm tra xem có đủ thông tin biến thể không
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setShowNotification(true);
      setNotificationMessage('Vui lòng chọn cấu hình và màu sắc sản phẩm!');
      setNotificationType('error');
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return;
    }
    
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    
    try {
      // Debug: log selectedVariant và các thông tin liên quan
      console.log("selectedVariant:", selectedVariant);
      console.log("colorName:", selectedColor);
      console.log("config:", selectedConfig);
      console.log("currentPrice:", currentPrice);
      
      // Sử dụng ID của biến thể nếu có, nếu không thì dùng ID sản phẩm
      const itemId = Number(productId);
      
      // Khởi tạo các giá trị cần thiết từ selectedVariant
      let variantId = null;
      let price = null;
      
      if (selectedVariant) {
        variantId = selectedVariant.id;
        price = selectedVariant.price;
      }
      
      // Tìm ID của màu sắc nếu có
      let colorId = null;
      if (product.colors && selectedColor) {
        const colorObj = product.colors.find(c => c.colorName === selectedColor);
        if (colorObj) {
          colorId = colorObj.id;
          console.log("Found colorObj:", colorObj);
        }
      }
      
      // Đảm bảo price là kiểu số, không phải chuỗi hoặc có định dạng khác
      if (typeof price === 'string') {
        price = parseInt(price.replace(/[^\d]/g, ''));
      }
      
      // Tạo options
      const options = {
        colorId: colorId,
        variantId: variantId,
        price: price || currentPrice
      };
      
      console.log("Sending options:", options);
      
      const response = await addToCart(itemId, quantity, options);
      
      let message = '';
      if (typeof response === 'object' && response.message) {
        message = response.message;
      } else if (typeof response === 'string') {
        message = response;
      } else {
        let productInfo = product.name;
        if (selectedColor && selectedConfig) {
          productInfo += ` (${selectedColor}, ${selectedConfig})`;
        }
        message = `Đã thêm ${quantity} ${productInfo} vào giỏ hàng!`;
      }
      
      setShowNotification(true);
      setNotificationMessage(message);
      setNotificationType('success');
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      
      setShowNotification(true);
      setNotificationMessage(error.message || 'Không thể thêm sản phẩm vào giỏ hàng!');
      setNotificationType('error');
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫"
  }

  // Nhóm các biến thể theo màu sắc
  const getVariantsByColor = () => {
    if (!product?.variants?.length) return {};
    
    return product.variants.reduce((acc, variant) => {
      if (!acc[variant.color]) {
        acc[variant.color] = [];
      }
      acc[variant.color].push(variant);
      return acc;
    }, {});
  }

  // Nhóm các biến thể theo cấu hình RAM/ROM
  const getVariantsByConfig = () => {
    if (!product?.variants?.length) return {};
    
    return product.variants.reduce((acc, variant) => {
      const config = `${variant.ram}/${variant.rom}`;
      if (!acc[config]) {
        acc[config] = [];
      }
      acc[config].push(variant);
      return acc;
    }, {});
  }

  // Lấy danh sách ảnh thumbnail không trùng lặp
  const getUniqueColorImages = () => {
    // Nếu có danh sách colors riêng, ưu tiên sử dụng
    if (product?.colors && product.colors.length > 0) {
      return product.colors.filter(color => color.image);
    }
    
    // Nếu không có danh sách colors hoặc không có ảnh trong colors, dùng ảnh từ variants
    if (product?.variants && product.variants.length > 0) {
      const uniqueImages = [];
      const imageMap = new Map();
      
      product.variants.forEach(variant => {
        if (variant.image && !imageMap.has(variant.image)) {
          imageMap.set(variant.image, true);
          uniqueImages.push({
            image: variant.image,
            colorName: variant.color
          });
        }
      });
      
      return uniqueImages;
    }
    
    return [];
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

  const variantsByColor = getVariantsByColor();
  const variantsByConfig = getVariantsByConfig();

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
            <img src={currentImage || "/placeholder.svg"} alt={product.name} className="main-image" />
          </div>
          
          {/* Phần hiển thị ảnh thumbnail của các màu sắc */}
          {product && (
            <div className="product-variant-images">
              {getUniqueColorImages().map((item, index) => (
                <div 
                  key={index} 
                  className={`variant-image-item ${currentImage === item.image ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(item.image, item.colorName)}
                  title={item.colorName}
                >
                  <img src={item.image} alt={`${product.name} - ${item.colorName}`} />
                </div>
              ))}
            </div>
          )}
          
          {/* Mô tả sản phẩm ngắn đã chuyển xuống dưới */}
          <div className="product-short-description">
            <h3>Mô tả tóm tắt</h3>
            {product.description.length > 350 
              ? product.description.substring(0, 350).split(' ').slice(0, -1).join(' ') + '...' 
              : product.description}
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
            <span className="current-price">{formatPrice(currentPrice)}</span>
          </div>

          {(product.variants && product.variants.length > 0) || (product.colors && product.colors.length > 0) ? (
            <div className="product-variants">
              {/* Hiển thị cấu hình RAM/ROM */}
              {Object.keys(variantsByConfig).length > 0 && (
                <div className="variant-section">
                  <h3>Cấu hình</h3>
                  <div className="variant-options">
                    {Object.keys(variantsByConfig).map(config => (
                      <button 
                        key={config} 
                        className={`variant-option ${selectedConfig === config ? 'active' : ''}`}
                        onClick={() => handleConfigSelect(config)}
                      >
                        {config}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Hiển thị màu sắc */}
              {(Object.keys(variantsByColor).length > 0 || (product.colors && product.colors.length > 0)) && (
                <div className="variant-section">
                  <h3>Màu sắc</h3>
                  <div className="variant-options">
                    {/* Nếu có danh sách màu riêng, ưu tiên sử dụng nó */}
                    {product.colors && product.colors.length > 0 ? (
                      product.colors.map(colorObj => (
                        <button 
                          key={colorObj.id} 
                          className={`variant-option color-option ${selectedColor === colorObj.colorName ? 'active' : ''}`}
                          onClick={() => handleColorSelect(colorObj.colorName, colorObj.image)}
                        >
                          {colorObj.colorName}
                        </button>
                      ))
                    ) : (
                      Object.keys(variantsByColor).map(color => (
                        <button 
                          key={color} 
                          className={`variant-option color-option ${selectedColor === color ? 'active' : ''}`}
                          onClick={() => handleColorSelect(color)}
                        >
                          {color}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}

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
                  <div className="spec-value">{selectedVariant ? selectedVariant.ram : product.ram}</div>
                </div>
                <div className="spec-row">
                  <div className="spec-name">Bộ nhớ trong</div>
                  <div className="spec-value">{selectedVariant ? selectedVariant.rom : product.rom}</div>
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

      {/* Phần "Có thể bạn cũng thích" */}
      <RelatedProducts currentProductId={product?.id} />
    </div>
  )
}

// Component hiển thị sản phẩm liên quan
const RelatedProducts = ({ currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!currentProductId) return

      try {
        setLoading(true)
        // Lấy danh sách sản phẩm ngẫu nhiên thay vì lọc theo danh mục
        const response = await callApiWithAuth(`/products/v1`)
        
        if (response && response.content) {
          // Lọc bỏ sản phẩm hiện tại và chọn ngẫu nhiên tối đa 4 sản phẩm
          const filteredProducts = response.content
            .filter(product => product.id !== currentProductId)
          
          // Trộn ngẫu nhiên và lấy tối đa 4 sản phẩm
          const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random())
          const randomProducts = shuffled.slice(0, 4)
          
          setRelatedProducts(randomProducts)
        }
        setLoading(false)
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm ngẫu nhiên:", error)
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId])

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  if (loading || relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="related-products-section">
      <h2 className="related-title">* Có thể bạn cũng thích *</h2>
      <div className="related-products-grid">
        {relatedProducts.map((product) => (
          <div key={product.id} className="related-product-card">
            <a href={`/product/${product.id}`} className="related-product-link">
              <div className="related-product-image">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="related-product-info">
                <h3 className="related-product-name">{product.name}</h3>
                <div className="related-product-price">
                  <span className="related-current-price">{formatPrice(product.price)}đ</span>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductDetail


