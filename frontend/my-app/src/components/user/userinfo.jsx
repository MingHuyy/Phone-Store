import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaPen, FaKey, FaSave, FaTimes } from "react-icons/fa";
import "../../assets/css/userinfo.css";
import { callApiWithAuth } from "../../utils/AuthService";

const UserInfo = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        phone: "",
        role: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        role: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Lấy thông tin người dùng khi component được mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await callApiWithAuth("/users/info");

                setFormData({
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone || "",
                });
                setUser(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Xử lý thay đổi form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Xóa lỗi khi người dùng bắt đầu nhập lại
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null,
            });
        }
    };

    // Xác thực form
    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = "Tên đăng nhập không được để trống";
        }

        if (!formData.email) {
            errors.email = "Email không được để trống";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email không hợp lệ";
        }

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            errors.phone = "Số điện thoại phải có 10 chữ số";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Xử lý lưu thông tin
    const handleSave = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setSaveLoading(true);

            try {
                // Gọi API để cập nhật thông tin người dùng
                const updatedData = await callApiWithAuth("/users/update", {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });

                // Cập nhật thông tin người dùng trong state
                setUser({
                    ...user,
                    ...updatedData
                });

                setSaveSuccess(true);
                setIsEditing(false);

                // Ẩn thông báo thành công sau 3 giây
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            } catch (err) {
                setError(err.message);
            } finally {
                setSaveLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                phone: user.phone || "",
            });
        }
        setFormErrors({});
    };

    if (loading) {
        return (
            <div className="user-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="user-container">
                <div className="error-message">
                    <h3>Đã xảy ra lỗi</h3>
                    <p>{error}</p>
                    <button className="primary-button" onClick={() => window.location.reload()}>
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-container">
            <div className="user-card">
                <div className="user-header">
                    <div className="user-avatar">
                        <div className="avatar-circle">{user.username.charAt(0).toUpperCase()}</div>
                    </div>
                    <h1>Thông tin tài khoản</h1>
                    {!isEditing && (
                        <button className="edit-button" onClick={() => setIsEditing(true)} aria-label="Chỉnh sửa thông tin">
                            <FaPen />
                            <span>Chỉnh sửa</span>
                        </button>
                    )}
                </div>

                {saveSuccess && (
                    <div className="success-alert">
                        <span>✓</span> Thông tin đã được cập nhật thành công!
                    </div>
                )}

                <div className="user-content">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="user-form">
                            <div className="form-group">
                                <label htmlFor="username">
                                    <FaUser className="field-icon" /> Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={formErrors.username ? "error" : ""}
                                />
                                {formErrors.username && <span className="error-text">{formErrors.username}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <FaEnvelope className="field-icon" /> Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={formErrors.email ? "error" : ""}
                                />
                                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    <FaPhone className="field-icon" /> Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={formErrors.phone ? "error" : ""}
                                />
                                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                            </div>

                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={handleCancel}>
                                    <FaTimes /> Hủy
                                </button>
                                <button type="submit" className="save-button" disabled={saveLoading}>
                                    {saveLoading ? (
                                        <>
                                            <div className="button-spinner"></div> Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <FaSave /> Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="user-info">
                            <div className="info-item">
                                <div className="info-label">
                                    <FaUser className="field-icon" />
                                    <span>Tên đăng nhập:</span>
                                </div>
                                <div className="info-value">{user.username}</div>
                            </div>

                            <div className="info-item">
                                <div className="info-label">
                                    <FaEnvelope className="field-icon" />
                                    <span>Email:</span>
                                </div>
                                <div className="info-value">{user.email}</div>
                            </div>

                            <div className="info-item">
                                <div className="info-label">
                                    <FaPhone className="field-icon" />
                                    <span>Số điện thoại:</span>
                                </div>
                                <div className="info-value">{user.phone || "Chưa cập nhật"}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-footer">
                    <Link to="/" className="home-button">
                        <FaHome /> Trang chủ
                    </Link>
                    <Link to="/resetpassword" className="change-password-button">
                        <FaKey /> Thay đổi mật khẩu
                    </Link>
                </div>
            </div>
        </div>
    )
};

export default UserInfo;