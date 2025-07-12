import { axiosPublic } from "../util/axios";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const useRefreshToken = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const refreshAccessToken = async () => {
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    try {
      if (isMounted) {
        const response = await axiosPublic.get("/auth/refreshAccessToken", {
          signal,
          withCredentials: true,
        });
        login(response.data.accessToken);

        return response;
      }
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        navigate("/login", { state: { from: location.pathname }, replace: true });
      }
    }
    return () => {
      isMounted = false;
      controller.abort();
    };
  };
  return refreshAccessToken;
};

export default useRefreshToken;
