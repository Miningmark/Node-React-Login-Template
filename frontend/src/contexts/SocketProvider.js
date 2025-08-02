import { createContext, useEffect, useState } from "react";
import { initializeSocket, getSocket, closeSocket } from "util/socket";

export const SocketContext = createContext(null);

export const SocketProvider = ({ accessToken, children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (accessToken) {
      initializeSocket(accessToken).then(() => {
        setSocket(getSocket());
      });
    }

    return () => {
      closeSocket();
      setSocket(null);
    };
  }, [accessToken]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
