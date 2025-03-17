import { useState } from "react";
import logo from "../../assets/logo.jpg";
import '../../assets/css/Header.css';
import { FaUser, FaShoppingCart, FaSearch } from 'react-icons/fa';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const logOut = () => {
        if (window.confirm("Xác nhận đăng xuất ?")) {
            console.log("Đăng xuất thành công");
        }
    };

    return (
        <div className="header-container">
            <div className="header">
                <div className="logo">
                    <a href="index.html">
                        <img src={logo} alt="Trang chủ Smartphone Store" title="Trang chủ Smartphone Store" />
                    </a>
                </div>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Nhập từ khóa tìm kiếm..."
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <FaSearch />
                        <span>Tìm kiếm</span>
                    </button>
                </div>

                <div className="header-actions">
                    <div className="account-button">
                        <a onClick={toggleMenu}>
                            <FaUser className="icon" />
                            <span>Tài khoản</span>
                        </a>
                        {isMenuOpen && (
                            <div className="account-dropdown">
                                <a href="nguoidung.html">Trang người dùng</a>
                                <a onClick={logOut}>Đăng xuất</a>
                            </div>
                        )}
                    </div>

                    <div className="cart-button">
                        <a href="giohang.html">
                            <FaShoppingCart className="icon" />
                            <span>Giỏ hàng</span>
                            <span className="cart-count"></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
