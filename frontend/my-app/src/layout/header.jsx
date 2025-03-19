import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo.jpg";
import '../assets/css/header.css';
import { FaUser, FaShoppingCart, FaSearch, FaHome, FaInfoCircle, FaWrench, FaPhone } from 'react-icons/fa';

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);

        if (showMenu) {
            const handleClickOutside = (event) => {
                if (!event.target.closest(".member")) {
                    setShowMenu(false);
                }
            };

            document.addEventListener("click", handleClickOutside);

            return () => {
                document.removeEventListener("click", handleClickOutside);
            };
        }
    }, [showMenu]);


    const logOut = () => {
        if (window.confirm("Xác nhận đăng xuất ?")) {
            localStorage.clear();
            setIsLoggedIn(false);
            setShowMenu(false);
            alert("Đăng xuất thành công");
            navigate("/");
        }
    };

    return (
        <header>
            <div className="top-nav group">
                <section>
                    <ul className="top-nav-quicklink flexContain">
                        <li><Link to="/"><FaHome /> Trang chủ</Link></li>
                        <li><Link to="/gioithieu"><FaInfoCircle /> Giới thiệu</Link></li>
                        <li><Link to="/trungtambaohanh"><FaWrench /> Bảo hành</Link></li>
                        <li><Link to="/lienhe"><FaPhone /> Liên hệ</Link></li>
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
                    <div className="search-header" style={{ position: "relative", left: "162px", top: "1px" }}>
                        <form className="input-search" method="get" action="/">
                            <div className="autocomplete">
                                <input id="search-box" name="search" autoComplete="off" type="text" placeholder="Nhập từ khóa tìm kiếm..." />
                                <button type="submit">
                                    <FaSearch /> Tìm kiếm
                                </button>
                            </div>
                        </form>
                        <div className="tags">
                            <strong>Từ khóa: </strong>
                        </div>
                    </div>

                    <div className="tools-member">
                        <div className="member">
                            <a onClick={() => setShowMenu(!showMenu)} style={{ cursor: "pointer" }}>
                                <FaUser /> Tài khoản
                            </a>
                            {showMenu && (
                                <div className="menuMember">
                                    {isLoggedIn ? (
                                        <>
                                            <Link to="/users/info">Trang người dùng</Link>
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
                                        e.preventDefault(); // Ngăn chặn chuyển trang
                                        alert("Bạn phải đăng nhập để vào giỏ hàng!");
                                    }
                                }}
                            >
                                <FaShoppingCart />
                                <span>Giỏ hàng</span>
                                <span className="cart-number"></span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
