// nexus/frontend/src/hooks/useAuth.ts
'use client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';

export function useAuth() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const setAuth = useStore((s) => s.setAuth);
  const clearAuth = useStore((s) => s.clearAuth);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await api.auth.login(email, password);
      setAuth(result.user, result.token);
      return result.user;
    },
    [setAuth],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await api.auth.register(email, password, name);
      setAuth(result.user, result.token);
      return result.user;
    },
    [setAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push('/');
  }, [clearAuth, router]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };
}
