import { io } from "socket.io-client";

let socket = null;

/**
 * getSocket — returns a single shared, authenticated socket connection.
 * Call this once auth is confirmed; call disconnectSocket() on logout.
 */
export function getSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem("tp_token");
  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
