import { FaMapMarkerAlt, FaPhone, FaGlobe, FaEnvelope, FaCreditCard, FaUniversity } from "react-icons/fa"
import "../assets/css/contact.css"

const Contact = () => {
    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Liên hệ</h1>
                <div className="header-underline"></div>
            </div>

            <div className="contact-content">
                <div className="contact-info">
                    <h2 className="company-name">CÔNG TY CỔ PHẦN H - GROUP</h2>

                    <div className="info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <div>
                            <strong>Địa chỉ:</strong>
                            <p>Học viện Công nghệ Bưu chính Viễn thông - 96a Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FaPhone className="info-icon" />
                        <div>
                            <strong>Telephone:</strong>
                            <p>0123.456.789</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FaGlobe className="info-icon" />
                        <div>
                            <strong>Website:</strong>
                            <p>
                                <a href="https://ptit.edu.vn/" target="_blank" rel="noopener noreferrer">
                                    Học viện Công nghệ Bưu chính viễn thông
                                </a>
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FaEnvelope className="info-icon" />
                        <div>
                            <strong>E-mail:</strong>
                            <p>
                                <a href="mailto:HuyLM.B22CN383@stu.ptit.edu.vn">HuyLM.B22CN383@stu.ptit.edu.vn</a>
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FaCreditCard className="info-icon" />
                        <div>
                            <strong>Tài khoản ngân hàng:</strong>
                            <p>0123456789</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FaUniversity className="info-icon" />
                        <div>
                            <strong>Tại Ngân hàng:</strong>
                            <p>Agribank Chi nhánh Hà Nội</p>
                        </div>
                    </div>

                    <div className="contact-message">
                        <p>
                            Quý khách có thể gửi liên hệ tới chúng tôi thông qua email hoặc số điện thoại được cung cấp ở trên. Chúng
                            tôi luôn luôn sẵn lòng giải đáp các thắc mắc của quý khách. Hân hạnh phục vụ và chân thành cảm ơn sự quan
                            tâm, đóng góp ý kiến đến Smartphone Store.
                        </p>
                    </div>
                </div>

                <div className="contact-map">
                    <div className="map-container">
                        <iframe
                            src="https://maps.google.com/maps?width=100%&height=450&hl=en&coord=20.981214990203462,105.78739648038169&q=96A%20%C4%90.%20Tr%E1%BA%A7n%20Ph%C3%BA%2C%20P.%20M%E1%BB%99%20Lao%2C%20H%C3%A0%20Dong%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam&ie=UTF8&t=&z=16&iwloc=B&output=embed"
                            title="Bản đồ Học viện Công nghệ Bưu chính viễn thông"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact

