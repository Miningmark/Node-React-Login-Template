// components/RequireAuth.js
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const RequireAuth = ({ children, allowedRoles }) => {
  const { accessToken, username, roles } = useContext(AuthContext);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = allowedRoles ? roles.some((role) => allowedRoles.includes(role)) : true;

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
