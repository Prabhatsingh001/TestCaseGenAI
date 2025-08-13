import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("github_token") || "");
  const [user, setUser] = useState(null);

  // Extract token from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("token");

    if (accessToken) {
      localStorage.setItem("github_token", accessToken);
      setToken(accessToken);

      // Remove token from URL after storing
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  // Fetch GitHub user info
  useEffect(() => {
    if (token && !user) {
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`
        }
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error("Error fetching GitHub user:", err));
    }
  }, [token, user]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        No token found. Please login again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-indigo-600">Welcome to TestGenAI</h1>

      {user && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="w-16 h-16 rounded-full border mb-2"
          />
          <h2 className="text-lg font-semibold">{user.name || user.login}</h2>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      )}

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            localStorage.removeItem("github_token");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
