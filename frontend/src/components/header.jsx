"use client"

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.jpg";
import '../assets/css/header.css';
import { FaUser, FaShoppingCart, FaSearch, FaHome, FaInfoCircle, FaWrench, FaPhone } from 'react-icons/fa';
import { callApiWithAuth } from "../utils/AuthService";

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    // Lấy số lượng sản phẩm trong giỏ hàng
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

    // Đăng ký hàm cập nhật số lượng giỏ hàng
    useEffect(() => {
        window.updateCartCount = (addedItems = 1) => {
            setCartItemCount(prev => prev + addedItems);
        };
        
        return () => {
            delete window.updateCartCount;
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showMenu && 
                menuRef.current && 
                !menuRef.current.contains(event.target) && 
                menuButtonRef.current && 
                !menuButtonRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

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

    return (
        <header>
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
                        <form className="input-search" method="get" action="/">
                            <div className="autocomplete">
                                <input id="search-box" name="search" autoComplete="off" type="text" placeholder="Nhập từ khóa tìm kiếm..." />
                                <button type="submit">
                                    <FaSearch /> Tìm kiếm
                                </button>
                            </div>
                        </form>
                        <div className="tags">
                            <strong>Từ khóa: </strong><span>iPhone</span> • <span>Samsung</span> • <span>Xiaomi</span> • <span>OPPO</span>
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
