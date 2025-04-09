"use client"

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.jpg";
import '../assets/css/header.css';
import { FaUser, FaShoppingCart, FaSearch, FaHome, FaInfoCircle, FaWrench, FaPhone } from 'react-icons/fa';
import { callApiWithAuth } from "../utils/AuthService";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);
    const headerRef = useRef(null);
    const searchFormRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchCartItemCount();
        }
    }, [isLoggedIn]);

    const fetchCartItemCount = async () => {
        try {
            const response = await callApiWithAuth('/api/carts');
            if (Array.isArray(response)) {
                setCartItemCount(response.length);
            }
        } catch (error) {
            console.error("Không thể lấy số lượng giỏ hàng:", error);
            setCartItemCount(0);
        }
    };

    useEffect(() => {
        window.updateCartCount = (addedItems = 1) => {
            setCartItemCount(prev => prev + addedItems);
        };

        window.refreshCartCount = () => {
            fetchCartItemCount();
        };

        return () => {
            delete window.updateCartCount;
            delete window.refreshCartCount;
        };
    }, []);

    const logOut = async () => {
        if (!window.confirm("Xác nhận đăng xuất?")) return;
        try {
            await callApiWithAuth("/auth/logout", { method: "POST" });
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsLoggedIn(false);
            setShowMenu(false);
            setCartItemCount(0);
            alert("Đăng xuất thành công");
            navigate("/");
            window.location.reload();
        } catch (error) {
            alert("Đăng xuất không thành công");
            console.error("Lỗi logout:", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (!searchKeyword.trim()) return;

        try {
            setIsSearching(true);
            const keyword = searchKeyword;
            setSearchKeyword("");
            
            // Kiểm tra xem đang ở trang nào
            const currentPath = location.pathname;
            
            // Nếu đang ở trang chủ hoặc trang khác không phải products, chuyển đến trang products
            if (currentPath !== "/products") {
                navigate(`/products?search=${encodeURIComponent(keyword)}`);
            } else {
                // Nếu đã ở trang products, chỉ cập nhật URL
                const params = new URLSearchParams(location.search);
                params.set("search", keyword);
                navigate(`${currentPath}?${params.toString()}`);
            }
            
            setIsSearching(false);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            setIsSearching(false);
        }
    };

    const handleQuickSearch = (keyword) => {
        try {
            setIsSearching(true);
            setSearchKeyword("");
            
            // Kiểm tra xem đang ở trang nào
            const currentPath = location.pathname;
            
            // Nếu đang ở trang chủ hoặc trang khác không phải products, chuyển đến trang products
            if (currentPath !== "/products") {
                navigate(`/products?search=${encodeURIComponent(keyword)}`);
            } else {
                // Nếu đã ở trang products, chỉ cập nhật URL
                const params = new URLSearchParams(location.search);
                params.set("search", keyword);
                navigate(`${currentPath}?${params.toString()}`);
            }
            
            setIsSearching(false);
        } catch (error) {
            console.error("Lỗi khi tìm kiếm nhanh:", error);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchFromUrl = queryParams.get('search');

        if (searchFromUrl) {
            setSearchKeyword(searchFromUrl);
        }
    }, [location.search]);

    return (
        <header ref={headerRef}>
            <div className="top-nav group">
                <section>
                    <ul className="top-nav-quicklink flexContain">
                        <li><Link to="/"><FaHome /> Trang chủ</Link></li>
                        <li><Link to="/aboutus"><FaInfoCircle /> Giới thiệu</Link></li>
                        <li><Link to="/baohanh"><FaWrench /> Bảo hành</Link></li>
                        <li><Link to="/contact"><FaPhone /> Liên hệ</Link></li>
                    </ul>
                </section>
            </div>

            <div className="header group">
                <div className="logo">
                    <Link to="/">
                        <img src={logo} alt="Trang chủ Smartphone Store" title="Trang chủ Smartphone Store" />
                    </Link>
                </div>

                <div className="content">
                    <div className="search-header">
                        <form className="input-search" onSubmit={handleSearch} ref={searchFormRef}>
                            <div className="autocomplete">
                                <input
                                    id="search-box"
                                    name="search"
                                    autoComplete="off"
                                    type="text"
                                    placeholder="Nhập từ khóa tìm kiếm..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    disabled={isSearching}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {isSearching ? (
                                        <span>Đang tìm...</span>
                                    ) : (
                                        <>
                                            <FaSearch /> Tìm kiếm
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="tags">
                            <strong>Từ khóa: </strong>
                            <span onClick={(e) => {
                                e.stopPropagation();
                                if (!isSearching) handleQuickSearch("iPhone");
                            }} style={{ cursor: isSearching ? "default" : "pointer" }}>iPhone</span> •
                            <span onClick={(e) => {
                                e.stopPropagation();
                                if (!isSearching) handleQuickSearch("Samsung");
                            }} style={{ cursor: isSearching ? "default" : "pointer" }}>Samsung</span> •
                            <span onClick={(e) => {
                                e.stopPropagation();
                                if (!isSearching) handleQuickSearch("Xiaomi");
                            }} style={{ cursor: isSearching ? "default" : "pointer" }}>Xiaomi</span> •
                            <span onClick={(e) => {
                                e.stopPropagation();
                                if (!isSearching) handleQuickSearch("OPPO");
                            }} style={{ cursor: isSearching ? "default" : "pointer" }}>OPPO</span>
                        </div>
                    </div>

                    <div className="tools-member">
                        <div className="member">
                            <a
                                ref={menuButtonRef}
                                onClick={() => setShowMenu(!showMenu)}
                                style={{ cursor: "pointer" }}
                            >
                                <FaUser /> Tài khoản
                            </a>
                            {showMenu && (
                                <div className="menuMember" ref={menuRef}>
                                    {isLoggedIn ? (
                                        <>
                                            <Link to="/users/info" onClick={() => setShowMenu(false)}>Trang người dùng</Link>
                                            <a onClick={logOut} style={{ cursor: "pointer" }}>Đăng xuất</a>
                                            <Link to="/orderdetail" onClick={() => setShowMenu(false)}>Đơn hàng đã mua</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/login">Đăng nhập</Link>
                                            <Link to="/register">Đăng ký</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="cart">
                            <Link
                                to={isLoggedIn ? "/cart" : "#"}
                                onClick={(e) => {
                                    if (!isLoggedIn) {
                                        e.preventDefault();
                                        alert("Bạn phải đăng nhập để vào giỏ hàng!");
                                    }
                                    setShowMenu(false);
                                }}
                            >
                                <FaShoppingCart />
                                <span>Giỏ hàng</span>
                                {cartItemCount > 0 && (
                                    <span className="cart-number">{cartItemCount}</span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
