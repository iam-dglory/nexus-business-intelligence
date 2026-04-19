// nexus/frontend/src/hooks/useSocket.ts
'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from '../store/useStore';

export function useSocket() {
  const token = useStore((s) => s.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    socketRef.current = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.info('[Socket] Connected');
    });

    socketRef.current.on('connection:new', (data) => {
      // Could trigger a toast/notification here
      console.info('[Socket] New connection request:', data);
    });

    socketRef.current.on('connection:updated', (data) => {
      console.info('[Socket] Connection updated:', data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
