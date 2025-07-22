import { axiosProtected } from "../util/axios";
import { useEffect, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import useRefreshToken from "./useRefreshToken";

const useAxiosProtected = () => {
    const { accessToken, setAccessToken } = useContext(AuthContext);
    const refreshAccessToken = useRefreshToken();

    const isRefreshing = useRef(false);
    const refreshAndRetryQueue = useRef([]);

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

                if (error?.response?.status === 403 && !prevRequest._retry) {
                    prevRequest._retry = true;

                    if (!isRefreshing.current) {
                        isRefreshing.current = true;

                        try {
                            const response = await refreshAccessToken();
                            setAccessToken(response.data.accessToken);

                            refreshAndRetryQueue.current.forEach(({ config, resolve, reject }) => {
                                config.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
                                axiosProtected.request(config).then(resolve).catch(reject);
                            });

                            refreshAndRetryQueue.current = [];

                            prevRequest.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
                            return axiosProtected(prevRequest);
                        } catch (err) {
                            refreshAndRetryQueue.current = [];
                            return Promise.reject(err);
                        } finally {
                            isRefreshing.current = false;
                        }
                    }

                    return new Promise((resolve, reject) => {
                        refreshAndRetryQueue.current.push({ config: prevRequest, resolve, reject });
                    });
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axiosProtected.interceptors.request.eject(requestIntercept);
            axiosProtected.interceptors.response.eject(responseIntercept);
        };
    }, [accessToken, refreshAccessToken, setAccessToken]);

    return axiosProtected;
};

export default useAxiosProtected;
