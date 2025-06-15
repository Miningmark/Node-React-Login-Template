import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [roles, setRoles] = useState({});
  const [config, setConfig] = useState({});

  const login = (newAccessToken, username, roles, config) => {
    setAccessToken(newAccessToken);
    setUsername(username);
    setRoles(roles);
    setConfig(config);
  };

  const logout = () => {
    setAccessToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, username, roles, config, setRoles, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
