"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaHome } from "react-icons/fa"
import "../../assets/css/auth.css";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        })

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Kiểm tra tên tài khoản
        if (!formData.username.trim()) {
            newErrors.username = "Vui lòng nhập tên tài khoản"
        }

        // Kiểm tra email
        if (!formData.email) {
            newErrors.email = "Vui lòng nhập email"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ"
        }

        // Kiểm tra số điện thoại
        if (!formData.phone) {
            newErrors.phone = "Vui lòng nhập số điện thoại"
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại phải có 10 chữ số"
        }

        // Kiểm tra mật khẩu
        if (!formData.password) {
            newErrors.password = "Vui lòng nhập mật khẩu"
        } else if (formData.password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự"
        }

        // Kiểm tra xác nhận mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm()) {
            setLoading(true)

            try {
                // Gửi dữ liệu đăng ký lên server
                const response = await fetch('http://localhost:1111/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userName: formData.username,
                        email: formData.email,
                        phone: formData.phone,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Đăng ký thất bại');
                }

                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');

            } catch (error) {
                console.error('Lỗi đăng ký:', error);
                setErrors({
                    ...errors,
                    general: error.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.'
                });
            } finally {
                setLoading(false);
            }
        }
    }


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
    }

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-left">
                    <div className="auth-left-content">
                        <h2>Tham gia cùng chúng tôi</h2>
                        <p>Tạo tài khoản để trải nghiệm mua sắm tuyệt vời và nhận nhiều ưu đãi độc quyền.</p>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <h1>Đăng Ký</h1>
                        <p className="auth-subtitle">Tạo tài khoản mới</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="username">Tên tài khoản</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        placeholder="Nhập tên tài khoản"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={errors.username ? "error" : ""}
                                    />
                                </div>
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-group">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Nhập email của bạn"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? "error" : ""}
                                    />
                                </div>
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <div className="input-group">
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="Nhập số điện thoại của bạn"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? "error" : ""}
                                    />
                                </div>
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Mật khẩu</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Tạo mật khẩu"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? "error" : ""}
                                    />
                                    <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Xác nhận mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? "error" : ""}
                                    />
                                    <button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>
                            <div className="form-group checkbox-group">
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        className={errors.agreeTerms ? "error" : ""}
                                    />
                                    <label htmlFor="agreeTerms">
                                        Tôi đồng ý với Điều khoản và Chính sách bảo mật
                                    </label>
                                </div>
                                {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                            </div>

                            <button type="submit" className="auth-button" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đăng Ký"}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                            </p>
                        </div>

                        <div className="home-button-container" style={{ display: "flex", justifyContent: "center" }}>
                            <Link to="/" className="home-button" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FaHome /> Trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
