import axios from "axios";

const BASE_URL = `${process.env.REACT_APP_SERVER_URL + (process.env.REACT_APP_SERVER_PORT === "" ? "" : ":" + process.env.REACT_APP_SERVER_PORT)}/api/${process.env.REACT_APP_API_VERSION}`;

const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

const axiosProtected = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

export { axiosPublic, axiosProtected };
