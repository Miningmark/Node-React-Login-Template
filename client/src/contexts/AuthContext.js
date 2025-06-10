import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem("accessToken"));
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (accessToken) {
      console.log("Token found:", accessToken);
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      setRoles(payload.roles || []);
    }
  }, [accessToken]);

  const login = (newAccessToken) => {
    sessionStorage.setItem("accessToken", newAccessToken);
    setAccessToken(newAccessToken);
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    setAccessToken(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, roles }}>
      {children}
    </AuthContext.Provider>
  );
};
