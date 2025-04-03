"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaKey } from "react-icons/fa"
import "../../assets/css/userinfo.css"
import { callApiWithAuth } from "../../utils/AuthService"

const ResetPassword = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })

        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null,
            })
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Kiểm tra mật khẩu hiện tại
        if (!formData.currentPassword) {
            newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại"
        }

        // Kiểm tra mật khẩu mới
        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới"
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại"
        }

        // Kiểm tra xác nhận mật khẩu
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới"
        } else if (formData.confirmPassword !== formData.newPassword) {
            newErrors.confirmPassword = "Xác nhận mật khẩu không khớp"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (validateForm()) {
            setLoading(true)

            try {
                // Sử dụng callApiWithAuth để gửi yêu cầu đổi mật khẩu
                const response = await callApiWithAuth("/auth/reset-password", {
                    method: "POST",
                    body: JSON.stringify({
                        oldPassword: formData.currentPassword,
                        newPassword: formData.newPassword,
                        confirmPassword: formData.confirmPassword
                    })
                });

                setSuccess(true);

                setTimeout(() => {
                    navigate("/users/info");
                }, 3000);
            } catch (error) {
                alert("Lỗi khi đổi mật khẩu: " + error.message);

                setErrors({
                    ...errors,
                    general: error.message || "Đã xảy ra lỗi khi thay đổi mật khẩu. Vui lòng thử lại."
                });
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <div className="user-container">
            <div className="user-card">
                <div className="user-header">
                    <div className="password-icon">
                        <FaKey />
                    </div>
                    <h1>Thay đổi mật khẩu</h1>
                </div>

                <div className="back-link">
                    <Link to="/users/info">
                        <FaArrowLeft /> Quay lại thông tin tài khoản
                    </Link>
                </div>

                <div className="user-content">
                    {success ? (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h3>Đổi mật khẩu thành công!</h3>
                            <p>
                                Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng về trang thông tin tài khoản sau vài giây.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="user-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                                <div className="password-input-group">
                                    <FaLock className="field-icon" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className={errors.currentPassword ? "error" : ""}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Mật khẩu mới</label>
                                <div className="password-input-group">
                                    <FaLock className="field-icon" />
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={errors.newPassword ? "error" : ""}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                                <div className="password-input-group">
                                    <FaLock className="field-icon" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={errors.confirmPassword ? "error" : ""}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                            </div>

                            <div className="password-requirements">
                                <h4>Yêu cầu mật khẩu:</h4>
                                <ul>
                                    <li>Ít nhất 6 ký tự</li>
                                    <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                    <li>Không nên sử dụng thông tin cá nhân dễ đoán</li>
                                </ul>
                            </div>

                            <button type="submit" className="primary-button full-width" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div className="button-spinner"></div> Đang xử lý...
                                    </>
                                ) : (
                                    "Đổi mật khẩu"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResetPassword

