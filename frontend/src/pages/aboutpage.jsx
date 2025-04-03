import React from 'react';
import { motion } from "framer-motion";
import { FaStore, FaCheckCircle, FaAward, FaUsers, FaHandshake } from "react-icons/fa";
import '../assets/css/aboutpage.css';
import logo from "../assets/img/logo1.jpg";

export default function AboutUs() {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const valueItems = [
        {
            icon: <FaCheckCircle className="value-icon value-icon-green" />,
            title: "Chất lượng",
            description: "Cam kết 100% sản phẩm chính hãng với chế độ bảo hành toàn diện"
        },
        {
            icon: <FaAward className="value-icon value-icon-yellow" />,
            title: "Uy tín",
            description: "Được hàng nghìn khách hàng tin tưởng và đánh giá cao"
        },
        {
            icon: <FaUsers className="value-icon value-icon-blue" />,
            title: "Chuyên nghiệp",
            description: "Đội ngũ nhân viên được đào tạo bài bản, tận tâm với khách hàng"
        },
        {
            icon: <FaHandshake className="value-icon value-icon-purple" />,
            title: "Hậu mãi",
            description: "Chính sách hậu mãi rõ ràng, hỗ trợ khách hàng trọn đời"
        }
    ];

    return (
        <div className="about-us-container">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="about-us-wrapper"
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="about-us-header"
                >
                    <div className="about-us-icon-container">
                        <FaStore className="about-us-icon" />
                    </div>
                    <h1 className="about-us-title">
                        Giới thiệu về <span className="about-us-highlight">Smartphone Store</span>
                    </h1>
                    <div className="about-us-divider"></div>
                    <p className="about-us-subtitle">
                        Hệ thống phân phối điện thoại uy tín hàng đầu Việt Nam!
                    </p>
                </motion.div>

                {/* Main Content */}
                <motion.div variants={itemVariants}>
                    <div className="about-us-card">
                        <div className="about-us-card-content">
                            {/* Image Section */}
                            <div className="about-us-image-section">
                                <div className="about-us-image-overlay"></div>
                                <div className="about-us-image-container">
                                    <motion.img
                                        src={logo}
                                        alt="Phone Store"
                                        className="about-us-image"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="about-us-text-section">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <p className="about-us-paragraph">
                                        Chào mừng bạn đến với <span className="about-us-highlight">Smartphone Store</span> – hệ thống phân phối điện thoại uy tín hàng đầu!
                                        Với nhiều năm kinh nghiệm trong lĩnh vực kinh doanh thiết bị di động, chúng tôi tự hào mang đến cho khách hàng những sản phẩm chính hãng
                                        với chất lượng đảm bảo và giá cả hợp lý.
                                    </p>

                                    <p className="about-us-paragraph">
                                        Đội ngũ nhân viên chuyên nghiệp và tận tâm của chúng tôi luôn sẵn sàng tư vấn, hỗ trợ khách hàng trong quá trình lựa chọn sản phẩm phù hợp.
                                        Mục tiêu của chúng tôi là không ngừng phát triển, nâng cao dịch vụ để đáp ứng nhu cầu ngày càng cao của khách hàng.
                                    </p>

                                    <p className="about-us-paragraph">
                                        Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi. Hãy khám phá ngay những sản phẩm mới nhất tại <span className="about-us-highlight">Smartphone Store</span>!
                                    </p>

                                    <motion.div
                                        className="about-us-button-container"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <a href="/products" className="about-us-button">
                                            Khám phá sản phẩm
                                            <svg className="about-us-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </a>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Values Section */}
                <motion.div
                    variants={itemVariants}
                    className="about-us-values-section"
                >
                    <h2 className="about-us-section-title">Giá trị cốt lõi của chúng tôi</h2>

                    <div className="about-us-values-grid">
                        {valueItems.map((item, index) => (
                            <motion.div
                                key={index}
                                className="about-us-value-card"
                                whileHover={{ y: -5 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className="about-us-value-content">
                                    <div className="about-us-value-icon-container">
                                        {item.icon}
                                    </div>
                                    <div className="about-us-value-text">
                                        <h3 className="about-us-value-title">{item.title}</h3>
                                        <p className="about-us-value-description">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
