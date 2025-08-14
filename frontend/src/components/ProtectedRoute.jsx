import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  let token = localStorage.getItem("github_token");
  const params = new URLSearchParams(location.search);

  // If token is in URL, store it and clean the URL
  if (params.get("token")) {
    token = params.get("token");
    localStorage.setItem("github_token", token);
    // Remove token from URL without reloading
    const cleanUrl = location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
