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

  const registerUser = async (e) => {
    e.preventDefault();

    if (!user.tel.startsWith("+")) {
      alert('Phone number must start with a "+" and include the country code.');
      return;
    }

    try {
      const options = {
        method: "POST",
        body: JSON.stringify(user),
        headers: { "Content-Type": "application/json" },
      };

      const response = await fetch(
        "http://localhost:8080/api/notifications/register",
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // If the request is successful, navigate to the Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Notification Error:", error.message);
      alert("Failed to register notification. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="p-8 border-2 border-gray-700 rounded-lg shadow-lg bg-white max-w-sm w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Sign Up</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          By signing up, you agree to our terms and conditions. Learn about our Privacy Policy before clicking submit.
        </p>

        <form onSubmit={registerUser} className="space-y-4">
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
          
          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" required className="mr-2" />
            I agree to the terms and conditions
          </label>
          
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
