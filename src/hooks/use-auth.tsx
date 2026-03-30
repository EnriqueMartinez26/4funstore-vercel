'use client';

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';
import { Logger } from '@/lib/logger';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Sin token no hay sesión: evita hacer un request al backend que siempre va a devolver 401
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        Logger.debug("[Auth] Verificando sesión con Backend...");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await ApiClient.getProfile({ signal: controller.signal });
        clearTimeout(timeout);

        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // Token inválido: limpiarlo para no hacer requests muertos en el futuro
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error: any) {
        if (error?.status === 401) {
          // Token expirado → limpiar silenciosamente sin redirigir (el usuario está en home)
          localStorage.removeItem('token');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiClient.login({ email, password });
      Logger.debug('[Auth] Login response:', response);
      if (response.success) {
        setUser(response.user);
        // Persiste el token: api.ts lo lee en cada request para inyectar Authorization: Bearer
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Credenciales inválidas' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await ApiClient.register({ name, email, password });
      if (response.success) {
        setUser(response.user);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return { success: true };
      }
      return { success: false, message: 'Error en registro' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await ApiClient.logout();
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const response = await ApiClient.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        // getProfile devolvió success: false sin lanzar → token inválido
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error: any) {
      if (error?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      console.error('[Auth] Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}