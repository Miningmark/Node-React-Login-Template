import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";

const RequireAuth = ({ children, allowedRoles }) => {
  const { accessToken, username, roles } = useContext(AuthContext);
  const location = useLocation();
  const refreshAccessToken = useRefreshToken();

  const [isLoading, setIsLoading] = useState(!accessToken);
  const [authReady, setAuthReady] = useState(!!accessToken);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refreshAccessToken();
        setAuthReady(true);
      } catch (err) {
        setAuthReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!accessToken) {
      verifyRefreshToken();
    }
  }, [accessToken, refreshAccessToken]);

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!authReady) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRole = allowedRoles ? roles.some((role) => allowedRoles.includes(role)) : true;

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
