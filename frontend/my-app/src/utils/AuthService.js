// src/utils/api.js
const API_BASE_URL = "http://localhost:1111";

export const callApiWithAuth = async (url, options = {}) => {
    const accessToken = localStorage.getItem("accessToken");

    // Thêm header Authorization nếu có token
    options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };

    try {
        let response = await fetch(`${API_BASE_URL}${url}`, options);

        // Xử lý token hết hạn
        if (response.status === 401) {
            const newToken = await refreshToken();
            if (!newToken) {
                throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            options.headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(`${API_BASE_URL}${url}`, options);
        }

        if (!response.ok) {
            let errorMessage = `Lỗi HTTP ${response.status}`;

            try {
                const text = await response.text();
                errorMessage = JSON.parse(text).message || text;
            } catch (e) {
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
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
    } catch (err) {
        console.error("Lỗi khi làm mới token:", err);
        return null;
    }
};
