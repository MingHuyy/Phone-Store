// src/utils/api.js
const API_BASE_URL = "http://localhost:1111";

export const callApiWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");
    
    // Kiểm tra xem body có phải là FormData không
    const isFormData = options.body instanceof FormData;
    
    // Thiết lập headers
    options.headers = {
        ...options.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };
    
    // Chỉ thêm Content-Type: application/json nếu KHÔNG phải FormData
    if (!isFormData) {
        options.headers["Content-Type"] = "application/json";
    }
    // Nếu là FormData, KHÔNG thiết lập Content-Type để browser tự xử lý

    try {
        let response = await fetch(`${API_BASE_URL}${url}`, options);

        // Xử lý token hết hạn
        if (response.status === 401) {
            try {
                const newToken = await refreshToken();
                if (!newToken) {
                    // Nếu refresh token thất bại, đăng xuất
                    logout();
                    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                }

                options.headers.Authorization = `Bearer ${newToken}`;
                response = await fetch(`${API_BASE_URL}${url}`, options);
                
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP ${response.status}`);
                }
            } catch (refreshError) {
                // Đảm bảo đăng xuất khi refresh token thất bại
                logout();
                throw refreshError;
            }
        } else if (!response.ok) {
            let errorMessage = `Lỗi HTTP ${response.status}`;

            try {
                const text = await response.text();
                errorMessage = JSON.parse(text).message || text;
            } catch (e) {
                // Nếu không parse được JSON, giữ nguyên errorMessage
                console.debug("Không thể parse JSON response:", e);
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (err) {
        console.error("API error:", err);
        throw err;
    }
};

export const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken); // Lưu cả refresh token mới
        return data.accessToken;
    } catch (err) {
        console.error("Lỗi khi làm mới token:", err);
        return null;
    }
};

export const logout = async () => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            // Gọi API đăng xuất
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
            } catch (error) {
                console.error("Không thể gọi API đăng xuất:", error);
                // Tiếp tục đăng xuất ngay cả khi API thất bại
            }
        }
    } finally {
        // Luôn xóa token khỏi localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Redirect về trang đăng nhập
        window.location.href = "/login";
    }
};