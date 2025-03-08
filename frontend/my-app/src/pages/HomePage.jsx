import { useEffect, useState } from "react";

const HomePage = () => {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:1111/")
            .then((res) => res.text())
            .then((data) => setMessage(data))
            .catch((error) => console.error("Error fetching message:", error));
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800">{message}</h1>
        </div>
    );
}

export default HomePage;
