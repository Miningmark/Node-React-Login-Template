import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [routeGroups, setRouteGroups] = useState(null);

  function login(newAccessToken, username, routeGroups) {
    setAccessToken(newAccessToken);
    setUsername(username);
    setRouteGroups(routeGroups);
  }

  async function logout() {
    setAccessToken(null);
    setUsername(null);
    setRouteGroups(null);
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        username,
        routeGroups,
        setAccessToken,
        setUsername,
        setRouteGroups,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
