import { useContext, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";
import useAxiosProtected from "./hook/useAxiosProtected";

const RequireAuth = ({ children, allowedRouteGroups }) => {
  const location = useLocation();
  const refreshAccessToken = useRefreshToken();
  const axiosProtected = useAxiosProtected();
  const { setUsername, setRouteGroups, username, accessToken, routeGroups, checkAccess } =
    useContext(AuthContext);

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

  async function test() {
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const fetchUser = async () => {
      console.log("Fetching user data...");
      try {
        const [userRes, routesRes] = await Promise.all([
          axiosProtected.get("/user/getUsername", { signal }),
          axiosProtected.get("/user/getRouteGroups", { signal }),
        ]);

        if (isMounted) {
          console.log("User data fetched successfully:");
          if (userRes.data?.username) setUsername(userRes.data.username);
          if (routesRes.data?.routeGroups) setRouteGroups(routesRes.data.routeGroups);
        }
      } catch (err) {
        if (err.name === "CanceledError") {
          console.log("Anfrage abgebrochen");
        } else {
          console.warn("Kein gültiger Login gefunden.");
        }
      }
    };

    if (!username) {
      fetchUser();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }

  console.log("RouteGroups:", routeGroups);
  if (!routeGroups) {
    test();
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
