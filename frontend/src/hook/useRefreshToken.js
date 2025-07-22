import { axiosPublic } from "../util/axios";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const useRefreshToken = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccessToken } = useContext(AuthContext);

  const refreshAccessToken = async () => {
    const controller = new AbortController();

    try {
      const response = await axiosPublic.get("/auth/refreshAccessToken", {
        signal: controller.signal,
        withCredentials: true,
      });
      setAccessToken(response.data.accessToken);
      return response;
    } catch (err) {
      if (err?.name === "CanceledError") {
        console.log("Request was cancelled");
      } else if (err?.response?.status === 403 || err?.response?.status === 401) {
        navigate("/login", { state: { from: location.pathname }, replace: true });
      } else {
        console.error("Refresh token error:", err);
      }
      return null;
    }
  };

  return refreshAccessToken;
};

export default useRefreshToken;
