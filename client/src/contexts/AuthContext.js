import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setRoles(payload.roles || []);
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setRoles([]);
    };

    return <AuthContext.Provider value={{ token, login, logout, roles }}>{children}</AuthContext.Provider>;
};
