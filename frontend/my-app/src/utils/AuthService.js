const API_BASE_URL = "http://localhost:1111";

const fetchWithAuth = async (url, options = {}) => {
    let accessToken = localStorage.getItem("accessToken");

    // Thêm header Authorization nếu có token
    options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    };

    let response = await fetch(`${API_BASE_URL}${url}`, options);

    if (response.status === 401) {
        // Token hết hạn, thử refresh token
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

        // Gọi lại API với token mới
        options.headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(`${API_BASE_URL}${url}`, options);
    }

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Lỗi khi gọi API");
    }

    return response.json();
};

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
        const response = await fetch("http://localhost:1111/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const { accessToken } = await response.json();
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
    } catch (err) {
        return null;
    }
};

export { fetchWithAuth };
