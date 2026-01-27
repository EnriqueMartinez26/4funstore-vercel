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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar (cookie HttpOnly) y cargar token desde localStorage
  useEffect(() => {
    // No need to cargar token desde localStorage; la sesión se maneja con cookie HttpOnly
    // Si el backend envía una cookie, el navegador la enviará automáticamente

    const checkSession = async () => {
      try {
        Logger.debug("[Auth] Verificando sesión con Backend...");
        const response = await ApiClient.getProfile();
        // El backend devuelve { success: true, data: user }
        if (response.success && (response.data || response.user)) {
          setUser(response.data || response.user);
        }
      } catch (error) {
        // Si falla, es que no hay cookie válida o expiró
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
        // Guardar token en localStorage como fallback (el proxy de Next.js no propaga cookies)
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
        // Guardar token en localStorage como fallback
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
      // Limpiar token y datos locales
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
      }
      // Redirigir o refrescar para limpiar estado completo
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}