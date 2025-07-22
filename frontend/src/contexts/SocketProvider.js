import { createContext, useEffect, useState } from "react";
import { initializeSocket, getSocket } from "util/socket";

export const SocketContext = createContext(null);

export const SocketProvider = ({ accessToken, children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (accessToken) {
      initializeSocket(accessToken).then(() => {
        setSocket(getSocket());
      });
    }
  }, [accessToken]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
