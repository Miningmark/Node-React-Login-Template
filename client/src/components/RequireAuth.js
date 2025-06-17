import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";

const RequireAuth = ({ children, allowedRoutes }) => {
  const { accessToken, routes } = useContext(AuthContext);
  const location = useLocation();
  const refreshAccessToken = useRefreshToken();

  const [isLoading, setIsLoading] = useState(!accessToken);

  async function loadAccessToken() {
    try {
      await refreshAccessToken();

      throw new Error("No access token received");
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  if (!accessToken) {
    loadAccessToken()
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredRoutes = allowedRoutes
    ? routes?.some((route) => allowedRoutes.includes(route) || route.name === "/admin")
    : false;

  console.log("Allowed Routes:", allowedRoutes);
  if (!hasRequiredRoutes && allowedRoutes.length > 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
