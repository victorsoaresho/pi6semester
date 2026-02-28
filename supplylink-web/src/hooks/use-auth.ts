'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/services/api';
import type { User, ApiResponse } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, setAuth, setUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !user) {
      api
        .get<ApiResponse<User>>('/users/me')
        .then((res) => setUser(res.data.data))
        .catch(() => logout());
    }
  }, [isAuthenticated, user, setUser, logout]);

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    setAuth(userData, accessToken);
    return userData;
  };

  const register = async (data: Record<string, unknown>) => {
    const res = await api.post<ApiResponse<User>>('/auth/register', data);
    return res.data.data;
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      logout();
      router.push('/login');
    }
  };

  return { user, isAuthenticated, login, register, logout: handleLogout };
}
