import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("github_token");
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  if (params.get("token")) {
    return children;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
