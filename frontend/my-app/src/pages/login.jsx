import { useState } from "react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:1111/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Đăng nhập thành công!");
            } else {
                setMessage(data.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            setMessage("Lỗi kết nối đến server");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-2 border rounded mb-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded mb-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Đăng nhập
                </button>
                {message && <p className="mt-2 text-red-500">{message}</p>}
            </div>
        </div>
    );
}