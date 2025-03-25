import "../assets/css/servicecenters.css"
import { FaMapMarkerAlt, FaPhone, FaClock, FaChevronRight } from "react-icons/fa"

const ServiceCenters = () => {
  const serviceCenters = [
    {
      id: 1,
      address: "96A Đ. Trần Phú, P. Mộ Lao, Hà Đông, Hà Nội, Việt Nam",
      phone: "0123.456.789",
      workingHours: "8h00 - 17h00",
    },
    {
      id: 2,
      address: "123 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh, Việt Nam",
      phone: "0987.654.321",
      workingHours: "8h00 - 17h30",
    },
  ]

  return (
    <div className="service-centers-container">
      <div className="service-centers-header">
        <h2>Trung tâm bảo hành của Smartphone Store</h2>
        <div className="service-centers-marquee">
          <div className="marquee-content">
            <span>Hỗ trợ bảo hành tận tâm - Dịch vụ chuyên nghiệp - Kỹ thuật cao</span>
          </div>
        </div>
      </div>

      <div className="service-centers-list">
        {serviceCenters.map((center) => (
          <div key={center.id} className="service-center-card">
            <div className="service-center-number">{center.id}</div>
            <div className="service-center-content">
              <div className="service-center-item">
                <div className="service-center-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="service-center-info">
                  <h3>Địa chỉ</h3>
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(center.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="service-center-link"
                  >
                    {center.address}
                    <FaChevronRight className="link-icon" />
                  </a>
                </div>
              </div>

              <div className="service-center-item">
                <div className="service-center-icon">
                  <FaPhone />
                </div>
                <div className="service-center-info">
                  <h3>Điện thoại</h3>
                  <p>{center.phone}</p>
                </div>
              </div>

              <div className="service-center-item">
                <div className="service-center-icon">
                  <FaClock />
                </div>
                <div className="service-center-info">
                  <h3>Thời gian làm việc</h3>
                  <p>{center.workingHours}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="service-centers-note">
        <p>Quý khách vui lòng mang theo hóa đơn mua hàng khi đến bảo hành sản phẩm</p>
        <p>
          Hotline hỗ trợ: <strong>1800 1234</strong> (Miễn phí cuộc gọi)
        </p>
      </div>
    </div>
  )
}

export default ServiceCenters

