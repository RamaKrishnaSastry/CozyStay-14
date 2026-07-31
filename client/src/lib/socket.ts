import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let globalSocket: Socket | null = null;
let subscribers = 0;

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(globalSocket);

  useEffect(() => {
    if (!token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      subscribers = 0;
      socketRef.current = null;
      return;
    }

    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        query: { token },
        transports: ['websocket', 'polling'],
      });
    }
    socketRef.current = globalSocket;
    subscribers += 1;

    return () => {
      subscribers -= 1;
      if (subscribers <= 0 && globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }
      socketRef.current = null;
    };
  }, [token]);

  return socketRef.current;
}

export function getSocket() {
  return globalSocket;
}
