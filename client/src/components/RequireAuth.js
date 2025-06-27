import { useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";

const RequireAuth = ({ children, allowedRouteGroups }) => {
  const { accessToken, routeGroups, checkAccess } = useContext(AuthContext);
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

  console.log("RouteGroups:", routeGroups);
  if (!routeGroups) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "4rem", height: "4rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const hasRequiredRouteGroups = checkAccess(allowedRouteGroups);

  console.log("Allowed RouteGroups:", allowedRouteGroups);
  if (!hasRequiredRouteGroups && allowedRouteGroups.length > 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
