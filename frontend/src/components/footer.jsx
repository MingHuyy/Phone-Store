import React from "react";
import '../assets/css/footer.css';
import { Link } from "react-router-dom";
import { FaHome, FaInfoCircle, FaWrench, FaPhone } from 'react-icons/fa';
import bct from '../assets/img/logoxacthuc.png';

const Footer = () => {
    return (
        <>
            {/* PLC Section */}
            <div className="plc">
                <section>
                    <ul className="flexContain">
                        <li>Giao hàng hỏa tốc trong 1 giờ</li>
                        <li>Thanh toán linh hoạt: tiền mặt, visa / master, trả góp</li>
                        <li>Trải nghiệm sản phẩm tại nhà</li>
                        <li>Lỗi đổi tại nhà trong 1 ngày</li>
                        <li>Hỗ trợ suốt thời gian sử dụng.
                            <br />Hotline: <a href="tel:12345678" style={{ color: "#288ad6" }}>12345678</a>
                        </li>
                    </ul>
                </section>
            </div>

            <div id="alert">
                <span id="closebtn">&otimes;</span>
            </div>

            {/* Footer Navigation */}
            <div className="footer-nav">
                <section>
                <ul className="footer-nav-links flexContain">
    <li>
        <a href="/" className="flex items-center gap-2">
            <FaHome /> Trang chủ
        </a>
    </li>
    <li>
        <a href="/aboutus" className="flex items-center gap-2">
            <FaInfoCircle /> Giới thiệu
        </a>
    </li>
    <li>
        <a href="/baohanh" className="flex items-center gap-2">
            <FaWrench /> Bảo hành
        </a>
    </li>
    <li>
        <a href="/contact" className="flex items-center gap-2">
            <FaPhone /> Liên hệ
        </a>
    </li>
</ul>

                </section>
            </div>

            {/* Footer Section */}
            <div className="copy-right">
                <p>
                    <a href="index.html"> Smartphone Store</a> - All rights reserved © 2025 - Designed by H
                    <span style={{ color: "#eee", fontWeight: "bold" }}> group 15th</span>
                </p>
                
                {/* Ảnh Bộ Công Thương */}
                <div className="bct-badge">
                    <img 
                        src={bct}
                        alt="Đã thông báo Bộ Công Thương" 
                        title="Đã thông báo Bộ Công Thương"
                        width="200"
                    />
                </div>
            </div>
        </>
    );
};

export default Footer;
