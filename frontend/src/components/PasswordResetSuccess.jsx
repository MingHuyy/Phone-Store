import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaSignInAlt, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import "../assets/css/passwordresetsuccess.css";

const PasswordResetSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10); // ✅ Thêm đếm ngược
  const navigate = useNavigate();

  useEffect(() => {
    const handleResetPassword = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refreshToken = urlParams.get('refreshToken');
        
        if (!refreshToken) {
          setError("Token không hợp lệ hoặc đã hết hạn");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:1111/auth/reset-password/v1?refreshToken=${refreshToken}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          setLoading(false);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Đã xảy ra lỗi khi đặt lại mật khẩu");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error resetting password:", err);
        setError("Không thể kết nối với máy chủ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    handleResetPassword();
  }, [navigate]);

  // ✅ Bắt đầu đếm ngược sau khi thành công
  useEffect(() => {
    if (!loading && !error) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, error]);

  // ✅ Redirect khi countdown = 0
  useEffect(() => {
    if (countdown === 0) {
      navigate('/login');
    }
  }, [countdown, navigate]);

  if (loading) {
    return (
      <div className="password-reset-container loading">
        <div className="password-reset-loading-spinner"></div>
        <p>Đang xử lý yêu cầu đặt lại mật khẩu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-error-card">
          <div className="password-reset-error-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Rất tiếc!</h2>
          <div className="password-reset-error-message">
            <p>{error}</p>
            <p className="password-reset-error-help">
              Có thể link đã hết hạn hoặc đã được sử dụng. Vui lòng thử lại hoặc yêu cầu link mới.
            </p>
          </div>
          <div className="password-reset-error-actions">
            <Link to="/forgot-password" className="password-reset-retry-button">
              <FaArrowLeft /> Yêu cầu link mới
            </Link>
            <Link to="/login" className="password-reset-login-button">
              <FaSignInAlt /> Đăng nhập
            </Link>
          </div>
          <div className="password-reset-home-link">
            <Link to="/" className="password-reset-home-button">
              <FaHome /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-success-card">
        <div className="password-reset-success-icon-container">
          <FaCheckCircle className="password-reset-success-icon" />
        </div>
        
        <h1 className="password-reset-success-title">Thành công!</h1>
        
        <p className="password-reset-success-message">Mật khẩu của bạn đã được đặt lại thành công!</p>
        
        <div className="password-reset-details-container">
          <p className="password-reset-details-text">
            Mật khẩu mới của bạn là: <strong>123456</strong>
          </p>
          <p className="password-reset-expiry-notice">
            Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản của bạn.
          </p>
        </div>
        
        <div className="password-reset-note-container">
          <p className="password-reset-note-text">
            Bạn sẽ được chuyển hướng về trang đăng nhập sau <strong>{countdown}s</strong>.
          </p>
        </div>
        
        <div className="password-reset-navigation-buttons">
          <Link to="/" className="password-reset-home-button">
            <FaHome /> Trang chủ
          </Link>
          <Link to="/login" className="password-reset-login-button">
            <FaSignInAlt /> Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
