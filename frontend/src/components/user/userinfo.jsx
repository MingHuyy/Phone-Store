import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaUser, FaEnvelope, FaPhone, FaUserTag, FaPen, FaKey, FaSave, FaTimes, FaCamera } from "react-icons/fa";
import "../../assets/css/userinfo.css";
import { callApiWithAuth } from "../../utils/AuthService";

const UserInfo = () => {
    const [user, setUser] = useState({
        username: "",
        email: "",
        phone: "",
        role: "",
        img: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        img: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Ref for file input
    const fileInputRef = useRef(null);
    // State for image preview
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await callApiWithAuth("/auth/info");

                setFormData({
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone || "",
                    img: userData.img || "",
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null,
            });
        }
    };

    // Handle avatar click to trigger file input
    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Handle file upload - convert to base64 for simplicity
            // In a real app, you might want to upload to a server instead
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    img: reader.result
                });
            };
        }
    };

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

    const handleSave = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setSaveLoading(true);

            try {
                const formDataToSend = new FormData();
                formDataToSend.append("username", formData.username);
                formDataToSend.append("email", formData.email);
                formDataToSend.append("phone", formData.phone || "");

                // Chỉ gửi ảnh nếu người dùng chọn
                if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
                    formDataToSend.append("img", fileInputRef.current.files[0]);
                }

                const updatedData = await callApiWithAuth("/auth/update", {
                    method: "PUT",
                    body: formDataToSend,
                    // KHÔNG thiết lập Content-Type ở đây
                });


                setUser({
                    ...user,
                    ...updatedData
                });

                setSaveSuccess(true);
                setIsEditing(false);
                setImagePreview(null); // Clear preview sau khi lưu

                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);
            } catch (err) {
                console.error("Chi tiết lỗi khi cập nhật:", err);
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
                img: user.img || "",
            });
        }
        setFormErrors({});
        setImagePreview(null); // Clear preview on cancel
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
                    <div
                        className="user-avatar"
                        onClick={handleAvatarClick}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Avatar Preview"
                                className="avatar-image"
                            />
                        ) : user.img ? (
                            <img
                                src={user.img}
                                alt="User Avatar"
                                className="avatar-image"
                            />
                        ) : (
                            <div className="avatar-circle">{user.username.charAt(0).toUpperCase()}</div>
                        )}

                        {isEditing && (
                            <div className="avatar-edit-overlay">
                                <FaCamera />
                                <span>Đổi ảnh</span>
                            </div>
                        )}
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
                                    disabled
                                    className="disabled"
                                />
                                <span className="helper-text">Tên đăng nhập không thể thay đổi</span>
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
    );
};

export default UserInfo;
