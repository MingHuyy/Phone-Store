import '../../assets/css/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-container">
            <div className="support-info">
                <div className="support-item">Giao hàng hỏa tốc trong 1 giờ</div>
                <div className="support-item">Thanh toán linh hoạt: tiền mặt, visa / master, trả góp</div>
                <div className="support-item">Trải nghiệm sản phẩm tại nhà</div>
                <div className="support-item">Lỗi đổi tại nhà trong 1 ngày</div>
                <div className="support-item">Hỗ trợ suốt thời gian sử dụng. Hotline: 12345678</div>
            </div>

            <div className="copyright">
                <p>LDD Phone Store - All rights reserved &copy; {currentYear} - Designed by <span>group 15th</span></p>
            </div>
        </footer>
    );
};

export default Footer;
