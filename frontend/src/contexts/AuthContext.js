import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [routeGroups, setRouteGroups] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [userId, setUserId] = useState(null);

  function login(newAccessToken, username, routeGroups, userId) {
    setAccessToken(newAccessToken);
    setUsername(username);
    setRouteGroups(routeGroups);
    setUserId(userId);
  }

  async function logout() {
    setAccessToken(null);
    setUsername(null);
    setRouteGroups(null);
    setAvatar(null);
    setUserId(null);
  }

  function checkAccess(allowedGroupNames) {
    if (!routeGroups) return false;

    if (routeGroups.includes("superAdmin")) {
      return true;
    }

    if (!allowedGroupNames) return false;
    if (allowedGroupNames.length === 0) return true;

    return allowedGroupNames.some((group) => routeGroups.includes(group));
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        username,
        routeGroups,
        avatar,
        userId,
        setAccessToken,
        setUsername,
        setRouteGroups,
        setAvatar,
        setUserId,
        login,
        logout,
        checkAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
