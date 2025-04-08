"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FaEnvelope, FaArrowLeft } from "react-icons/fa"
import "../../assets/css/auth.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setEmail(e.target.value)
        setError("")
    }

    const validateEmail = () => {
        if (!email) {
            setError("Vui lòng nhập email của bạn")
            return false
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Email không hợp lệ")
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (validateEmail()) {
            setLoading(true)

            try {
                const response = await fetch("http://localhost:1111/forgotpassword", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    setSuccess(true)
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || "Đã xảy ra lỗi khi gửi yêu cầu đặt lại mật khẩu");
                }
            } catch (error) {
                console.error("Lỗi:", error);
                setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-left">
                    <div className="auth-left-content">
                        <h2>Đặt lại mật khẩu</h2>
                        <p>Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.</p>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <Link to="/login" className="back-to-login">
                            <FaArrowLeft /> Quay lại đăng nhập
                        </Link>

                        <h1>Quên mật khẩu?</h1>
                        <p className="auth-subtitle">Đừng lo lắng, chúng tôi sẽ giúp bạn khôi phục mật khẩu</p>

                        {success ? (
                            <div className="success-message">
                                <div className="success-icon">✓</div>
                                <h3>Yêu cầu đã được gửi!</h3>
                                <p>
                                    Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp
                                    thư đến của bạn.
                                </p>
                                <p className="note">
                                    Nếu bạn không nhận được email trong vòng vài phút, hãy kiểm tra thư mục spam hoặc thử lại.
                                </p>
                                <div className="action-buttons">
                                    <button className="auth-button" onClick={() => setSuccess(false)}>
                                        Thử lại
                                    </button>
                                    <Link to="/login" className="secondary-button">
                                        Quay lại đăng nhập
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            id="email"
                                            placeholder="Nhập email đã đăng ký của bạn"
                                            value={email}
                                            onChange={handleChange}
                                            className={error ? "error" : ""}
                                        />
                                    </div>
                                    {error && <span className="error-message">{error}</span>}
                                </div>

                                <button type="submit" className="auth-button" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Gửi yêu cầu đặt lại mật khẩu"}
                                </button>
                            </form>
                        )}

                        <div className="auth-footer">
                            <p>
                                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword

