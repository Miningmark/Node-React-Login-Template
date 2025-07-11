import { io } from "socket.io-client";

export let socket;

export async function initializeSocket(accessToken) {
  if (socket?.connected || socket?.connecting) {
    console.log("Socket is already initializing or connected.");
    return;
  }
  const serverUrl = `${process.env.REACT_APP_SERVER_URL}:${process.env.REACT_APP_SOCKET_PORT}`;
  console.log("Connecting to socket server at:", serverUrl);
  try {
    socket = io(serverUrl, {
      auth: {
        accessToken: accessToken,
      },
      reconnection: true,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });
  } catch (error) {
    console.error("Error initializing socket:", error);
  }
}

export function getSocket() {
  if (!socket) {
    console.error("Socket not initialized. Call initializeSocket first.");
    return null;
  }
  return socket;
}
