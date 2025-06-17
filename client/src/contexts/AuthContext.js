import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [routes, setRoutes] = useState(null);

  function login(newAccessToken, username, routes) {
    setAccessToken(newAccessToken);
    setUsername(username);
    setRoutes(routes);
  }

  async function logout() {
    setAccessToken(null);
    setUsername(null);
    setRoutes(null);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        username,
        routes,
        setAccessToken,
        setUsername,
        setRoutes,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
