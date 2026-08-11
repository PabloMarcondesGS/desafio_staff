'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession } from '@/lib/types';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: (expired?: boolean) => void;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback((expired: boolean = false) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixcar_token');
    localStorage.removeItem('fixcar_user');
    if (typeof document !== 'undefined') {
      document.cookie = 'fixcar_token=; path=/; max-age=0';
    }
    if (expired) {
      router.push('/login?expired=1');
    } else {
      router.push('/login');
    }
  }, [router]);

  const checkSession = useCallback(async (): Promise<boolean> => {
    const currentToken = localStorage.getItem('fixcar_token');
    if (!currentToken) return false;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        logout(true);
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err) {
      return false;
    }
  }, [logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem('fixcar_token');
    const savedUser = localStorage.getItem('fixcar_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (typeof document !== 'undefined') {
          document.cookie = `fixcar_token=${savedToken}; path=/; max-age=3600; SameSite=Lax`;
        }
        // Validar imediatamente com o backend se ainda é válido
        checkSession();
      } catch (e) {
        localStorage.removeItem('fixcar_token');
        localStorage.removeItem('fixcar_user');
      }
    }
    setLoading(false);
  }, [checkSession]);

  // Checagem periódica a cada 15 segundos para detectar expiração
  useEffect(() => {
    if (!token || pathname === '/login') return;

    const interval = setInterval(() => {
      checkSession();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, [token, pathname, checkSession]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Falha ao autenticar' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('fixcar_token', data.token);
      localStorage.setItem('fixcar_user', JSON.stringify(data.user));

      if (typeof document !== 'undefined') {
        document.cookie = `fixcar_token=${data.token}; path=/; max-age=3600; SameSite=Lax`;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Erro de conexão com o servidor' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
