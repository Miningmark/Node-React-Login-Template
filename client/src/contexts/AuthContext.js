import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [user, setUser] = useState({});

  const login = (newAccessToken, username) => {
    setAccessToken(newAccessToken);
    setUsername(username);
  };

  const logout = () => {
    setAccessToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, username, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
