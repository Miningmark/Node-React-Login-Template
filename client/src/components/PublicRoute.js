import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "../hook/useRefreshToken";
import useAxiosProtected from "../hook/useAxiosProtected";
import { axiosPublic } from "../../util/axios";

export default function PublicRoute({ children }) {
  const { accessToken, setAccessToken, setUsername, setRoles, setConfig } = useContext(AuthContext);
  const refreshAccessToken = useRefreshToken();
  const axiosProtected = useAxiosProtected();

  async function loadAccessToken() {
    try {
      const res = await refreshAccessToken();
      if (!res?.data?.accessToken) {
        return;
      }
      await setAccessToken(() => res?.data?.accessToken);
      const res1 = await axiosProtected.get("/username");
      await setUsername(() => res1?.data?.username);
      const res2 = await axiosProtected.get("/user-roles");
      await setRoles(() => res2?.data?.roles);
      const res3 = await axiosPublic.get("/config");
      await setConfig(() => res3?.data?.config);
    } catch (error) {}
  }

  if (!accessToken) {
    loadAccessToken();
  }

  if (accessToken) {
    // Benutzer ist eingeloggt → Weiterleitung zum Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
