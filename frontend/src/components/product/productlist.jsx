"use client"

import { useState, useEffect } from "react"
import {
    FaShoppingCart,
    FaHeart,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaFilter,
    FaSortAmountDown,
    FaPlus,
} from "react-icons/fa"
import "../../assets/css/productlist.css"
import { callApiWithAuth } from "../../utils/AuthService"


const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("newest")
  const [filterOpen, setFilterOpen] = useState(false)
  
  // State chính để lưu trữ giá trị bộ lọc đang được áp dụng
  const [priceRange, setPriceRange] = useState([0, 50000000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // State tạm thời để lưu trữ giá trị bộ lọc khi người dùng điều chỉnh
  const [tempPriceRange, setTempPriceRange] = useState([0, 50000000])
  const [tempSelectedCategories, setTempSelectedCategories] = useState([])
  const [tempSearchQuery, setTempSearchQuery] = useState("")

  // Danh sách danh mục sản phẩm
  const categories = [
    { id: 1, name: "iPhone" },
    { id: 2, name: "Samsung" },
    { id: 3, name: "Xiaomi" },
    { id: 4, name: "OPPO" },
    { id: 5, name: "Vivo" },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        const queryParams = new URLSearchParams({
          page: currentPage - 1,
          size: 9,
          sort: sortBy,
        })

        if (priceRange[0] > 0) {
          queryParams.append("minPrice", priceRange[0])
        }
        if (priceRange[1] < 50000000) {
          queryParams.append("maxPrice", priceRange[1])
        }
        if (searchQuery) {
          queryParams.append("search", searchQuery)
        }
        if (selectedCategories.length > 0) {
          selectedCategories.forEach((categoryName) => {
            queryParams.append("categories", categoryName)
          })
        }

        const data = await callApiWithAuth(`/products/v1?${queryParams.toString()}`)
        
        const formattedProducts = data.content.map(product => {
          return {
            id: product.id,
            name: product.name || "Không có tên",
            price: product.price,
            originalPrice: product.originalPrice,
            discountPercent: product.discountPercent,
            image: product.image,
            inStock: product.stock > 0,
          }
        })

        setProducts(formattedProducts)
        setTotalPages(data.totalPages)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, sortBy, priceRange, selectedCategories, searchQuery])

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  // Xử lý thay đổi khoảng giá (chỉ cập nhật giá trị tạm thời)
  const handlePriceChange = (index, value) => {
    const newPriceRange = [...tempPriceRange]
    newPriceRange[index] = Number.parseInt(value)
    setTempPriceRange(newPriceRange)
  }

  // Xử lý thay đổi danh mục (chỉ cập nhật giá trị tạm thời)
  const handleCategoryChange = (category) => {
    setTempSelectedCategories((prev) => {
      if (prev.includes(category.name)) {
        return prev.filter((name) => name !== category.name)
      } else {
        return [...prev, category.name]
      }
    })
  }

  // Xử lý tìm kiếm (chỉ cập nhật giá trị tạm thời)
  const handleSearch = (e) => {
    e.preventDefault()
    setTempSearchQuery(searchQuery)
  }

  // Xử lý áp dụng bộ lọc
  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange)
    setSelectedCategories(tempSelectedCategories)
    setSearchQuery(tempSearchQuery)
    setCurrentPage(1) // Reset về trang đầu tiên
  }

  // Khởi tạo giá trị tạm thời khi component được tải
  useEffect(() => {
    setTempPriceRange(priceRange)
    setTempSelectedCategories(selectedCategories)
    setTempSearchQuery(searchQuery)
  }, [])

  // Format giá tiền
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Tạo mảng các trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang nếu tổng số trang ít hơn hoặc bằng maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1)

      // Tính toán trang bắt đầu và kết thúc để hiển thị
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Điều chỉnh nếu ở gần trang đầu hoặc cuối
      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      // Thêm dấu ... nếu cần
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Thêm dấu ... nếu cần
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Luôn hiển thị trang cuối cùng
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Tất cả sản phẩm</h1>
        <div className="breadcrumb">
          <a href="/">Trang chủ</a> / <span>Sản phẩm</span>
        </div>
      </div>

      <div className="product-list-content">
        {/* Sidebar - Bộ lọc */}
        <div className={`product-list-sidebar ${filterOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h3>Bộ lọc sản phẩm</h3>
            <button className="close-filter" onClick={() => setFilterOpen(false)}>
              ×
            </button>
          </div>

          <div className="filter-section">
            <h4>Danh mục sản phẩm</h4>
            <div className="category-filters">
              {categories.map((category) => (
                <div className="filter-item" key={category.id}>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={tempSelectedCategories.includes(category.name)}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <span className="checkmark"></span>
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Khoảng giá</h4>
            <div className="price-range-inputs">
              <div className="price-input">
                <label>Từ:</label>
                <input
                  type="number"
                  value={tempPriceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  min="0"
                  step="1000000"
                />
              </div>
              <div className="price-input">
                <label>Đến:</label>
                <input
                  type="number"
                  value={tempPriceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  min="0"
                  step="1000000"
                />
              </div>
            </div>
            <div className="price-range-slider">
              <input
                type="range"
                min="0"
                max="50000000"
                step="1000000"
                value={tempPriceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="price-slider min-price"
              />
              <input
                type="range"
                min="0"
                max="50000000"
                step="1000000"
                value={tempPriceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="price-slider max-price"
              />
            </div>
            <div className="price-range-labels">
              <span>{formatPrice(tempPriceRange[0])}đ</span>
              <span>{formatPrice(tempPriceRange[1])}đ</span>
            </div>
          </div>

          <button className="apply-filters-btn" onClick={handleApplyFilters}>Áp dụng bộ lọc</button>
        </div>

        {/* Main content */}
        <div className="product-list-main">
          {/* Toolbar */}
          <div className="product-list-toolbar">
            <button className="filter-toggle" onClick={() => setFilterOpen(!filterOpen)}>
              <FaFilter /> Bộ lọc
            </button>

            <div className="search-box">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <FaSearch />
                </button>
              </form>
            </div>

            <div className="sort-options">
              <label>
                <FaSortAmountDown />
                <select value={sortBy} onChange={handleSortChange}>
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                </select>
              </label>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">!</div>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Không có sản phẩm nào phù hợp với bộ lọc của bạn.</p>
              <button
                onClick={() => {
                  setSelectedCategories([])
                  setPriceRange([0, 50000000])
                  setSearchQuery("")
                  setSortBy("newest")
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  {!product.inStock && (
                    <div className="out-of-stock-overlay">Hết hàng</div>
                  )}

                  <a href={`/product/${product.id}`} className="product-link">
                    <div className="product-image">
                      <img src={product.image || "/placeholder.svg"} alt={product.name} />
                    </div>

                    <div className="product-info">
                      <h3 className="product-name">
                        {product.name || "Không có tên"}
                      </h3>

                      <div className="product-price">
                        <span className="current-price">{formatPrice(product.price)}đ</span>
                      </div>
                    </div>
                  </a>
                  
                  <button 
                    className={`add-to-cart ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!product.inStock) {
                        alert("Sản phẩm đã hết hàng!");
                        return;
                      }
                      // Xử lý thêm vào giỏ hàng ở đây
                      alert("Thêm vào giỏ hàng thành công!");
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && products.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-arrow"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>

              <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    className={`pagination-number ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                    onClick={() => page !== "..." && handlePageChange(page)}
                    disabled={page === "..."}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-arrow"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList

