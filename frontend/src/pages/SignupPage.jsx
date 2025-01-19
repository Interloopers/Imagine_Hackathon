import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [user, setUser] = useState({ email: "", tel: "" });
  const navigate = useNavigate();

  const updateUser = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const options = {
        method: "POST",
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" },
      };

      const response = await fetch(
        "http://localhost:8080/api/notifications/login", // Update with login endpoint
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // If the login is successful, navigate to the Dashboard
      if (data.success) {
        navigate("/dashboard");
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("Failed to log in. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="p-8 border-2 border-gray-700 rounded-lg shadow-lg bg-white max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Log In</h2>

        <form onSubmit={loginUser} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={updateUser}
            className="block w-full p-3 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200"
            required
          />
          <input
            type="tel"
            name="tel"
            placeholder="Enter phone number (e.g., +1234567890)"
            value={user.tel}
            onChange={updateUser}
            className="block w-full p-3 border-2 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Log In
          </button>
        </form>

      </div>
    </div>
  );
}
