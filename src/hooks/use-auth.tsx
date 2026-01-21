'use client';

import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { ApiClient } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null; // Mantenemos por compatibilidad, pero será null o dummy
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar (cookie HttpOnly)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await ApiClient.getProfile();
        if (response.success && response.user) {
          setUser(response.user);
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
      if (response.success) {
        setUser(response.user);
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
      // Opcional: Limpiar datos locales no sensibles como carrito
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart');
      }
      // Redirigir o refrescar para limpiar estado completo
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token: null, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}