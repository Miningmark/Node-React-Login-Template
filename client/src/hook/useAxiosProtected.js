import { axiosProtected } from "../util/axios";
import { useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "./useRefreshToken";

const useAxiosProtected = () => {
  const { accessToken, login } = useContext(AuthContext); // login wird als setAccessToken genutzt
  const refreshAccessToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosProtected.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosProtected.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;
          const response = await refreshAccessToken();
          login(response.data.accessToken);
          prevRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
          return axiosProtected(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosProtected.interceptors.request.eject(requestIntercept);
      axiosProtected.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, refreshAccessToken, login]);

  return axiosProtected;
};

export default useAxiosProtected;
