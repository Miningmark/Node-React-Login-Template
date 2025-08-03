import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";

export default function PublicRoute({ children, skipRedirectIfAuthenticated = false }) {
  const { accessToken, setAccessToken } = useContext(AuthContext);
  const refreshAccessToken = useRefreshToken();

  async function loadAccessToken() {
    try {
      const res = await refreshAccessToken();
      if (!res?.data?.accessToken) {
        return;
      }
      await setAccessToken(() => res?.data?.accessToken);
    } catch (error) {}
  }

  if (!accessToken) {
    loadAccessToken();
  }

  if (accessToken && !skipRedirectIfAuthenticated) {
    // Benutzer ist eingeloggt → Weiterleitung zum Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
