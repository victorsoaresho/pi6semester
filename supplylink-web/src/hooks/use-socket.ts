'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

export function useSocket(namespace: string = '') {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    const url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    socketRef.current = io(`${url}${namespace}`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [accessToken, namespace]);

  return socketRef;
}
