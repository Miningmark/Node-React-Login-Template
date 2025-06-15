import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [roles, setRoles] = useState({});
  const [config, setConfig] = useState({});

  function login(newAccessToken, username, roles, config) {
    setAccessToken(newAccessToken);
    setUsername(username);
    setRoles(roles);
    setConfig(config);
  }

  async function logout() {
    setAccessToken(null);
    setUsername(null);
    setRoles(null);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        username,
        roles,
        config,
        setAccessToken,
        setUsername,
        setRoles,
        setConfig,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
